import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  SEARCH_CORPUS_SCHEMA_VERSION,
  SEARCH_DISTANCE_METRIC,
  SEARCH_EMBEDDING_DIMENSIONS,
  SEARCH_EMBEDDING_MODEL,
  SEARCH_MAX_CHUNK_LENGTH,
  SEARCH_MIN_SOURCE_COUNT,
  SEARCH_MIN_VECTOR_COUNT,
  SEARCH_NAMESPACE,
  SEARCH_REQUIRED_SOURCE_PATHS,
  SEARCH_VECTOR_LIMIT,
  calculateSearchChunkDigest,
  calculateSearchCorpusVersion,
} from "./build-search-corpus.mjs";

export const PREVIEW_INDEX_NAME = "acecore-schools-search-preview";
export const PRODUCTION_INDEX_NAME = "acecore-schools-search-production";

const API_BASE_URL = "https://api.cloudflare.com/client/v4";
const DEFAULT_CORPUS_FILE = resolve(".vectorize/corpus.json");
const EMBEDDING_BATCH_SIZE = 32;
const UPSERT_BATCH_SIZE = 200;
const DELETE_BATCH_SIZE = 100;
const LIST_BATCH_SIZE = 1000;
const MUTATION_WAIT_TIMEOUT_MS = 180_000;
const MUTATION_POLL_INTERVAL_MS = 5_000;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_REQUEST_RETRIES = 5;
const RETRY_BASE_DELAY_MS = 500;
const MAX_LIST_CURSOR_RESTARTS = 3;
const MAX_DELETE_RATIO = 0.2;
const GET_BY_IDS_BATCH_SIZE = 100;
const MANAGED_VECTOR_ID_PATTERN = /^schools-v(?:1|2)-[0-9a-f]{48}$/u;
const V1_VECTOR_ID_PATTERN = /^schools-v1-[0-9a-f]{48}$/u;
const V2_VECTOR_ID_PATTERN = /^schools-v2-[0-9a-f]{48}$/u;
const CORPUS_VERSION_PATTERN = /^[0-9a-f]{20}$/u;
const ALLOWED_INDEX_NAMES = new Set([
  PREVIEW_INDEX_NAME,
  PRODUCTION_INDEX_NAME,
]);

class CloudflareApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "CloudflareApiError";
    this.status = status;
  }
}

export async function syncVectorize(options = {}) {
  const receiptFile = options.receiptFile
    ? resolve(options.receiptFile)
    : undefined;
  const startedAt = new Date().toISOString();
  const receiptBase = await createReceiptBase(options, startedAt);

  if (receiptFile) {
    await writeSyncReceipt(receiptFile, {
      ...receiptBase,
      status: "attempt",
    });
  }

  try {
    const result = await performVectorizeSync(options);
    if (receiptFile) {
      await writeSyncReceipt(receiptFile, {
        ...receiptBase,
        status: "success",
        completedAt: new Date().toISOString(),
        result,
      });
    }
    return result;
  } catch (error) {
    if (receiptFile) {
      await writeSyncReceipt(receiptFile, {
        ...receiptBase,
        status: "failure",
        completedAt: new Date().toISOString(),
        error: {
          name: error?.name || "Error",
          message: error?.message || String(error),
        },
      });
    }
    throw error;
  }
}

async function performVectorizeSync({
  accountId = process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken = process.env.CLOUDFLARE_API_TOKEN,
  indexName = process.env.VECTORIZE_INDEX_NAME,
  corpusFile = DEFAULT_CORPUS_FILE,
  dryRun = false,
  waitForMutations = true,
  allowV1ToV2Migration = false,
  confirmProductionVersion = process.env.VECTORIZE_CONFIRM_PRODUCTION_VERSION,
  fetchImpl = globalThis.fetch,
  requestTimeoutMs = REQUEST_TIMEOUT_MS,
  retryBaseDelayMs = RETRY_BASE_DELAY_MS,
  mutationPollIntervalMs = MUTATION_POLL_INTERVAL_MS,
  mutationWaitTimeoutMs = MUTATION_WAIT_TIMEOUT_MS,
  sleepImpl = sleep,
  randomImpl = Math.random,
  logger = console,
} = {}) {
  const corpus = JSON.parse(await readFile(corpusFile, "utf8"));
  validateCorpus(corpus);
  if (!dryRun && (!accountId || !apiToken || !indexName)) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, and VECTORIZE_INDEX_NAME are required.",
    );
  }
  validateIndexName(indexName, { required: !dryRun });
  validateProductionConfirmation(indexName, {
    dryRun,
    corpusVersion: corpus.version,
    confirmProductionVersion,
  });

  if (dryRun) {
    const result = {
      dryRun: true,
      indexName: indexName || null,
      corpusVersion: corpus.version,
      sources: corpus.sourceCount,
      vectors: corpus.vectorCount,
      locales: corpus.localeCounts,
    };
    logger.log(JSON.stringify({ event: "vectorize_sync_dry_run", ...result }));
    return result;
  }

  const client = createCloudflareClient({
    accountId,
    apiToken,
    fetchImpl,
    requestTimeoutMs,
    retryBaseDelayMs,
    sleepImpl,
    randomImpl,
  });
  const index = await getIndex(client, indexName);
  validateIndexConfiguration(index, indexName);

  const currentIds = await listVectorIds(client, indexName, {
    logger,
    sleepImpl,
    retryBaseDelayMs,
  });
  validateExistingVectorIds(currentIds, indexName);
  const expectedIds = new Set(corpus.chunks.map(({ id }) => id));
  const chunksToUpsert = corpus.chunks;
  const idsToDelete = [...currentIds].filter((id) => !expectedIds.has(id));
  validateDeletePlan({
    currentIds,
    expectedIds,
    idsToDelete,
    allowV1ToV2Migration,
  });

  const contentMatches =
    idsToDelete.length === 0 &&
    currentIds.size === expectedIds.size &&
    (await vectorsMatchCorpus(client, indexName, corpus.chunks));

  logger.log(
    JSON.stringify({
      event: "vectorize_sync_plan",
      indexName,
      corpusVersion: corpus.version,
      current: currentIds.size,
      expected: expectedIds.size,
      upsert: contentMatches ? 0 : chunksToUpsert.length,
      delete: idsToDelete.length,
      noop: contentMatches,
    }),
  );

  if (contentMatches) {
    const result = {
      dryRun: false,
      noop: true,
      indexName,
      corpusVersion: corpus.version,
      existing: currentIds.size,
      upserted: 0,
      deleted: 0,
      mutationId: null,
    };
    logger.log(JSON.stringify({ event: "vectorize_sync_complete", ...result }));
    return result;
  }

  const mutationIds = [];
  for (const chunkBatch of batches(chunksToUpsert, EMBEDDING_BATCH_SIZE)) {
    const embeddings = await createEmbeddings(client, chunkBatch);

    for (const vectorBatch of batches(
      chunkBatch.map((chunk, index) => ({
        id: chunk.id,
        values: embeddings[index],
        namespace: chunk.namespace,
        metadata: chunk.metadata,
      })),
      UPSERT_BATCH_SIZE,
    )) {
      const mutationId = await upsertVectors(client, indexName, vectorBatch);
      mutationIds.push(mutationId);
    }
  }

  for (const idBatch of batches(idsToDelete, DELETE_BATCH_SIZE)) {
    const mutationId = await deleteVectors(client, indexName, idBatch);
    mutationIds.push(mutationId);
  }

  const lastMutationId = mutationIds.at(-1);
  if (waitForMutations && lastMutationId) {
    await waitForMutation(client, indexName, lastMutationId, {
      sleepImpl,
      mutationPollIntervalMs,
      mutationWaitTimeoutMs,
    });
    const convergedIds = await listVectorIds(client, indexName, {
      logger,
      sleepImpl,
      retryBaseDelayMs,
    });
    validateExistingVectorIds(convergedIds, indexName);
    validateConvergence(convergedIds, expectedIds, indexName);
  }

  const result = {
    dryRun: false,
    noop: false,
    indexName,
    corpusVersion: corpus.version,
    existing: currentIds.size,
    upserted: chunksToUpsert.length,
    deleted: idsToDelete.length,
    mutationId: lastMutationId || null,
  };
  logger.log(JSON.stringify({ event: "vectorize_sync_complete", ...result }));
  return result;
}

export function validateCorpus(corpus) {
  if (corpus?.schemaVersion !== SEARCH_CORPUS_SCHEMA_VERSION) {
    throw new Error(
      `Corpus schemaVersion must be ${SEARCH_CORPUS_SCHEMA_VERSION}.`,
    );
  }
  if (
    corpus?.embedding?.model !== SEARCH_EMBEDDING_MODEL ||
    corpus?.embedding?.dimensions !== SEARCH_EMBEDDING_DIMENSIONS ||
    corpus?.embedding?.metric !== SEARCH_DISTANCE_METRIC
  ) {
    throw new Error(
      `Corpus embedding configuration must be ${SEARCH_EMBEDDING_MODEL}, ${SEARCH_EMBEDDING_DIMENSIONS} dimensions, ${SEARCH_DISTANCE_METRIC}.`,
    );
  }
  if (
    corpus?.chunking?.maximumCharacters !== SEARCH_MAX_CHUNK_LENGTH ||
    !Number.isInteger(corpus?.chunking?.targetCharacters) ||
    !Number.isInteger(corpus?.chunking?.overlapCharacters)
  ) {
    throw new Error("Corpus chunking configuration is invalid.");
  }
  if (!Array.isArray(corpus.chunks)) {
    throw new Error("Corpus chunks must be an array.");
  }
  if (
    !Number.isInteger(corpus.sourceCount) ||
    corpus.sourceCount < SEARCH_MIN_SOURCE_COUNT
  ) {
    throw new Error(
      `Corpus must contain at least ${SEARCH_MIN_SOURCE_COUNT} source documents.`,
    );
  }
  if (
    !Number.isInteger(corpus.vectorCount) ||
    corpus.chunks.length !== corpus.vectorCount ||
    corpus.chunks.length < SEARCH_MIN_VECTOR_COUNT ||
    corpus.chunks.length > SEARCH_VECTOR_LIMIT
  ) {
    throw new Error(
      `Corpus vector count must be between ${SEARCH_MIN_VECTOR_COUNT} and ${SEARCH_VECTOR_LIMIT}.`,
    );
  }

  const sourceUrls = validateSourceUrls(corpus.sourceUrls, corpus.sourceCount);
  const localeKeys = Object.keys(corpus.localeCounts || {});
  if (
    localeKeys.length !== 1 ||
    localeKeys[0] !== SEARCH_NAMESPACE ||
    corpus.localeCounts[SEARCH_NAMESPACE] !== corpus.vectorCount
  ) {
    throw new Error(
      `Corpus localeCounts must contain only ${SEARCH_NAMESPACE} and match vectorCount.`,
    );
  }

  const ids = new Set();
  const chunkSourceUrls = new Set();
  for (const chunk of corpus.chunks) {
    if (
      typeof chunk?.id !== "string" ||
      !MANAGED_VECTOR_ID_PATTERN.test(chunk.id) ||
      chunk?.namespace !== SEARCH_NAMESPACE ||
      typeof chunk?.text !== "string" ||
      !chunk.text.trim() ||
      chunk.text.length > SEARCH_MAX_CHUNK_LENGTH ||
      !isValidMetadata(chunk.metadata, sourceUrls) ||
      chunk.metadata.contentDigest !== calculateSearchChunkDigest(chunk)
    ) {
      throw new Error("Corpus contains an invalid chunk.");
    }
    if (ids.has(chunk.id)) throw new Error(`Duplicate vector id: ${chunk.id}`);
    ids.add(chunk.id);
    chunkSourceUrls.add(chunk.metadata.url);
  }

  if (
    chunkSourceUrls.size !== sourceUrls.size ||
    [...sourceUrls].some((url) => !chunkSourceUrls.has(url))
  ) {
    throw new Error("Every corpus source URL must have at least one chunk.");
  }

  const expectedVersion = calculateSearchCorpusVersion(corpus.chunks);
  if (
    typeof corpus.version !== "string" ||
    !CORPUS_VERSION_PATTERN.test(corpus.version) ||
    corpus.version !== expectedVersion
  ) {
    throw new Error("Corpus version does not match its vector IDs.");
  }
}

function validateSourceUrls(value, expectedCount) {
  if (!Array.isArray(value) || value.length !== expectedCount) {
    throw new Error("Corpus sourceUrls must match sourceCount.");
  }

  const urls = new Set();
  for (const url of value) {
    if (!isSafeRootRelativeUrl(url) || urls.has(url)) {
      throw new Error(
        "Corpus sourceUrls contains an invalid or duplicate URL.",
      );
    }
    urls.add(url);
  }
  const missing = SEARCH_REQUIRED_SOURCE_PATHS.filter((url) => !urls.has(url));
  if (missing.length > 0) {
    throw new Error(
      `Corpus is missing required source URLs: ${missing.join(", ")}.`,
    );
  }
  return urls;
}

function isValidMetadata(metadata, sourceUrls) {
  return (
    metadata &&
    typeof metadata === "object" &&
    !Array.isArray(metadata) &&
    typeof metadata.url === "string" &&
    sourceUrls.has(metadata.url) &&
    isSafeRootRelativeUrl(metadata.url) &&
    isBoundedString(metadata.title, 240, true) &&
    isBoundedString(metadata.section, 240, true) &&
    isBoundedString(metadata.excerpt, 500, false) &&
    isBoundedString(metadata.contentType, 40, true) &&
    metadata.locale === SEARCH_NAMESPACE &&
    typeof metadata.contentDigest === "string" &&
    CORPUS_VERSION_PATTERN.test(metadata.contentDigest)
  );
}

function isBoundedString(value, maximumLength, required) {
  return (
    typeof value === "string" &&
    value.length <= maximumLength &&
    (!required || value.trim().length > 0)
  );
}

function isSafeRootRelativeUrl(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.length > 500
  ) {
    return false;
  }
  try {
    const url = new URL(value, "https://schools.acecore.net");
    return (
      url.origin === "https://schools.acecore.net" &&
      url.pathname === value &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

function validateIndexName(indexName, { required }) {
  if (!indexName && !required) return;
  if (!ALLOWED_INDEX_NAMES.has(indexName)) {
    throw new Error(
      `VECTORIZE_INDEX_NAME must be one of: ${[...ALLOWED_INDEX_NAMES].join(", ")}.`,
    );
  }
}

function validateProductionConfirmation(
  indexName,
  { dryRun, corpusVersion, confirmProductionVersion },
) {
  if (
    dryRun ||
    indexName !== PRODUCTION_INDEX_NAME ||
    confirmProductionVersion === corpusVersion
  ) {
    return;
  }
  throw new Error(
    `Production sync requires --confirm-production ${corpusVersion} or VECTORIZE_CONFIRM_PRODUCTION_VERSION=${corpusVersion}.`,
  );
}

function validateExistingVectorIds(ids, indexName) {
  const unmanagedIds = [...ids].filter(
    (id) => !MANAGED_VECTOR_ID_PATTERN.test(id),
  );
  if (unmanagedIds.length === 0) return;

  throw new Error(
    `Vectorize index ${indexName} contains ${unmanagedIds.length} unmanaged vector id(s); refusing to mutate it.`,
  );
}

function validateDeletePlan({
  currentIds,
  expectedIds,
  idsToDelete,
  allowV1ToV2Migration,
}) {
  const currentCount = currentIds.size;
  const deleteCount = idsToDelete.length;
  if (
    deleteCount === 0 ||
    currentCount === 0 ||
    deleteCount / currentCount <= MAX_DELETE_RATIO
  ) {
    return;
  }

  const isRecoverableV1ToV2Migration =
    allowV1ToV2Migration &&
    [...expectedIds].every((id) => V2_VECTOR_ID_PATTERN.test(id)) &&
    idsToDelete.every((id) => V1_VECTOR_ID_PATTERN.test(id)) &&
    [...currentIds].every(
      (id) => V1_VECTOR_ID_PATTERN.test(id) || expectedIds.has(id),
    );
  if (isRecoverableV1ToV2Migration) return;

  const percentage = ((deleteCount / currentCount) * 100).toFixed(1);
  throw new Error(
    `Refusing to delete ${deleteCount}/${currentCount} vectors (${percentage}%); only the reviewed --migrate-v1-to-v2 path may exceed the ${MAX_DELETE_RATIO * 100}% safety limit.`,
  );
}

function validateConvergence(actualIds, expectedIds, indexName) {
  const missing = [...expectedIds].filter((id) => !actualIds.has(id));
  const unexpected = [...actualIds].filter((id) => !expectedIds.has(id));
  if (missing.length === 0 && unexpected.length === 0) return;
  throw new Error(
    `Vectorize index ${indexName} did not converge: ${missing.length} missing and ${unexpected.length} unexpected vector(s).`,
  );
}

export function extractEmbeddingData(payload, expectedCount) {
  const result = payload?.result ?? payload;
  const data = result?.data;

  if (!Array.isArray(data) || data.length !== expectedCount) {
    throw new Error(
      `Workers AI returned ${Array.isArray(data) ? data.length : 0} embeddings; expected ${expectedCount}.`,
    );
  }

  for (const values of data) {
    if (
      !Array.isArray(values) ||
      values.length !== SEARCH_EMBEDDING_DIMENSIONS ||
      values.some((value) => !Number.isFinite(value))
    ) {
      throw new Error(
        `Workers AI embedding must contain ${SEARCH_EMBEDDING_DIMENSIONS} finite values.`,
      );
    }
  }

  return data;
}

function createCloudflareClient({
  accountId,
  apiToken,
  fetchImpl,
  requestTimeoutMs,
  retryBaseDelayMs,
  sleepImpl,
  randomImpl,
}) {
  const accountBase = `${API_BASE_URL}/accounts/${encodeURIComponent(accountId)}`;

  return {
    async request(path, init = {}) {
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${apiToken}`);
      headers.set("Accept", "application/json");

      for (let attempt = 0; attempt <= MAX_REQUEST_RETRIES; attempt += 1) {
        const timeoutController = new AbortController();
        const timeout = setTimeout(
          () => timeoutController.abort(new Error("Request timed out.")),
          requestTimeoutMs,
        );
        try {
          const response = await fetchImpl(`${accountBase}${path}`, {
            ...init,
            headers,
            signal: timeoutController.signal,
          });

          if (
            isRetryableStatus(response.status) &&
            attempt < MAX_REQUEST_RETRIES
          ) {
            await response.body?.cancel().catch(() => {});
            clearTimeout(timeout);
            await sleepImpl(
              getRetryDelay({
                attempt,
                retryAfter: response.headers.get("Retry-After"),
                retryBaseDelayMs,
                randomImpl,
              }),
            );
            continue;
          }

          const payload = await readJsonResponse(response);
          if (!response.ok || payload?.success === false) {
            const message =
              payload?.errors
                ?.map((error) => error?.message)
                .filter(Boolean)
                .join("; ") ||
              `Cloudflare API request failed with ${response.status}.`;
            throw new CloudflareApiError(message, response.status);
          }
          return payload;
        } catch (error) {
          if (
            attempt >= MAX_REQUEST_RETRIES ||
            !isRetryableNetworkError(error, timeoutController.signal.aborted)
          ) {
            throw error;
          }
          clearTimeout(timeout);
          await sleepImpl(
            getRetryDelay({
              attempt,
              retryBaseDelayMs,
              randomImpl,
            }),
          );
        } finally {
          clearTimeout(timeout);
        }
      }

      throw new Error("Cloudflare API request exhausted all retries.");
    },
  };
}

function isRetryableStatus(status) {
  return status === 429 || status >= 500;
}

function isRetryableNetworkError(error, timedOut) {
  return (
    timedOut ||
    error instanceof TypeError ||
    error?.name === "AbortError" ||
    error?.name === "TimeoutError"
  );
}

function getRetryDelay({ attempt, retryAfter, retryBaseDelayMs, randomImpl }) {
  const exponentialDelay = retryBaseDelayMs * 2 ** attempt;
  const jitter = randomImpl() * retryBaseDelayMs;
  const retryAfterDelay = parseRetryAfter(retryAfter);
  return Math.max(exponentialDelay + jitter, retryAfterDelay);
}

function parseRetryAfter(value) {
  if (!value) return 0;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? Math.max(0, timestamp - Date.now()) : 0;
}

function sleep(milliseconds) {
  return new Promise((resolvePromise) =>
    setTimeout(resolvePromise, milliseconds),
  );
}

async function getIndex(client, indexName) {
  const encodedName = encodeURIComponent(indexName);
  try {
    const payload = await client.request(
      `/vectorize/v2/indexes/${encodedName}`,
    );
    return payload.result;
  } catch (error) {
    if (error instanceof CloudflareApiError && error.status === 404) {
      throw new Error(
        `Vectorize index ${indexName} does not exist. Create the reviewed 1024-dimension cosine index before syncing.`,
      );
    }
    throw error;
  }
}

function validateIndexConfiguration(index, indexName) {
  const config = index?.config;
  if (
    config?.dimensions !== SEARCH_EMBEDDING_DIMENSIONS ||
    config?.metric !== SEARCH_DISTANCE_METRIC
  ) {
    throw new Error(
      `Vectorize index ${indexName} must use ${SEARCH_EMBEDDING_DIMENSIONS} dimensions and ${SEARCH_DISTANCE_METRIC}.`,
    );
  }
}

async function listVectorIds(
  client,
  indexName,
  { logger, sleepImpl, retryBaseDelayMs },
) {
  for (let restart = 0; restart <= MAX_LIST_CURSOR_RESTARTS; restart += 1) {
    try {
      return await listVectorIdsOnce(client, indexName);
    } catch (error) {
      if (
        restart >= MAX_LIST_CURSOR_RESTARTS ||
        !(error instanceof CloudflareApiError) ||
        error.status !== 400 ||
        !/cursor/iu.test(error.message)
      ) {
        throw error;
      }

      logger.log(
        JSON.stringify({
          event: "vectorize_list_cursor_restart",
          indexName,
          restart: restart + 1,
        }),
      );
      await sleepImpl(retryBaseDelayMs * 2 ** restart);
    }
  }

  throw new Error("Vectorize list pagination exhausted all cursor restarts.");
}

async function listVectorIdsOnce(client, indexName) {
  const ids = new Set();
  let cursor = "";

  do {
    const query = new URLSearchParams({
      count: String(LIST_BATCH_SIZE),
    });
    if (cursor) query.set("cursor", cursor);
    const payload = await client.request(
      `/vectorize/v2/indexes/${encodeURIComponent(indexName)}/list?${query}`,
    );
    const result = payload.result || {};

    for (const vector of result.vectors || []) {
      if (typeof vector?.id !== "string") {
        throw new Error(
          `Vectorize index ${indexName} returned a vector without a valid id; refusing to mutate it.`,
        );
      }
      ids.add(vector.id);
    }

    cursor =
      result.isTruncated && typeof result.nextCursor === "string"
        ? result.nextCursor
        : "";
  } while (cursor);

  return ids;
}

async function vectorsMatchCorpus(client, indexName, chunks) {
  const expectedById = new Map(chunks.map((chunk) => [chunk.id, chunk]));
  const actualById = new Map();

  for (const chunkBatch of batches(chunks, GET_BY_IDS_BATCH_SIZE)) {
    const payload = await client.request(
      `/vectorize/v2/indexes/${encodeURIComponent(indexName)}/get_by_ids`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: chunkBatch.map(({ id }) => id) }),
      },
    );
    if (!Array.isArray(payload?.result)) {
      throw new Error(
        `Vectorize index ${indexName} returned an invalid get_by_ids response; refusing to mutate it.`,
      );
    }
    for (const vector of payload.result) {
      if (
        typeof vector?.id !== "string" ||
        actualById.has(vector.id) ||
        !expectedById.has(vector.id)
      ) {
        throw new Error(
          `Vectorize index ${indexName} returned an unexpected vector from get_by_ids; refusing to mutate it.`,
        );
      }
      actualById.set(vector.id, vector);
    }
  }

  if (actualById.size !== expectedById.size) return false;
  return [...expectedById].every(([id, expected]) => {
    const actual = actualById.get(id);
    return (
      actual?.namespace === expected.namespace &&
      metadataEquals(actual?.metadata, expected.metadata)
    );
  });
}

function metadataEquals(actual, expected) {
  if (
    !actual ||
    typeof actual !== "object" ||
    Array.isArray(actual) ||
    Object.keys(actual).length !== Object.keys(expected).length
  ) {
    return false;
  }
  return Object.keys(expected).every((key) => actual[key] === expected[key]);
}

async function createEmbeddings(client, chunks) {
  const payload = await client.request(`/ai/run/${SEARCH_EMBEDDING_MODEL}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: chunks.map(({ text }) => text),
      truncate_inputs: true,
    }),
  });
  return extractEmbeddingData(payload, chunks.length);
}

async function upsertVectors(client, indexName, vectors) {
  const ndjson = vectors.map((vector) => JSON.stringify(vector)).join("\n");
  const form = new FormData();
  form.set(
    "vectors",
    new Blob([`${ndjson}\n`], { type: "application/x-ndjson" }),
    "vectors.ndjson",
  );
  const payload = await client.request(
    `/vectorize/v2/indexes/${encodeURIComponent(indexName)}/upsert`,
    {
      method: "POST",
      body: form,
    },
  );
  return getMutationId(payload);
}

async function deleteVectors(client, indexName, ids) {
  const payload = await client.request(
    `/vectorize/v2/indexes/${encodeURIComponent(indexName)}/delete_by_ids`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    },
  );
  return getMutationId(payload);
}

function getMutationId(payload) {
  const value = payload?.result?.mutationId ?? payload?.mutationId;
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(
      "Cloudflare Vectorize mutation response did not include a valid mutationId.",
    );
  }
  return value;
}

async function waitForMutation(
  client,
  indexName,
  mutationId,
  { sleepImpl, mutationPollIntervalMs, mutationWaitTimeoutMs },
) {
  const deadline = Date.now() + mutationWaitTimeoutMs;

  while (Date.now() < deadline) {
    const payload = await client.request(
      `/vectorize/v2/indexes/${encodeURIComponent(indexName)}/info`,
    );
    if (payload?.result?.processedUpToMutation === mutationId) return;
    await sleepImpl(mutationPollIntervalMs);
  }

  throw new Error(
    `Vectorize mutation ${mutationId} was not queryable in time.`,
  );
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Cloudflare API returned a non-JSON response with ${response.status}.`,
    );
  }
}

function batches(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function createReceiptBase(options, startedAt) {
  const corpusFile = resolve(options.corpusFile || DEFAULT_CORPUS_FILE);
  let corpusVersion = null;
  try {
    const corpus = JSON.parse(await readFile(corpusFile, "utf8"));
    corpusVersion = typeof corpus?.version === "string" ? corpus.version : null;
  } catch {
    // The failure receipt records any subsequent corpus read/parse error.
  }

  return {
    schemaVersion: 1,
    startedAt,
    run: {
      repository: process.env.GITHUB_REPOSITORY || null,
      workflow: process.env.GITHUB_WORKFLOW || null,
      runId: process.env.GITHUB_RUN_ID || null,
      runAttempt: process.env.GITHUB_RUN_ATTEMPT || null,
      eventName: process.env.GITHUB_EVENT_NAME || null,
      eventCommit: process.env.GITHUB_SHA || null,
    },
    target: {
      indexName: options.indexName || process.env.VECTORIZE_INDEX_NAME || null,
      corpusVersion,
      migration: options.allowV1ToV2Migration === true,
    },
  };
}

async function writeSyncReceipt(receiptFile, receipt) {
  await mkdir(dirname(receiptFile), { recursive: true });
  await writeFile(receiptFile, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
}

function parseArguments(argv) {
  const options = {
    dryRun: false,
    waitForMutations: true,
    allowV1ToV2Migration: false,
    confirmProductionVersion: process.env.VECTORIZE_CONFIRM_PRODUCTION_VERSION,
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    indexName: process.env.VECTORIZE_INDEX_NAME,
    corpusFile: DEFAULT_CORPUS_FILE,
    receiptFile: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--no-wait") options.waitForMutations = false;
    else if (argument === "--migrate-v1-to-v2") {
      options.allowV1ToV2Migration = true;
    } else if (argument === "--confirm-production") {
      options.confirmProductionVersion = requireArgumentValue(
        argv,
        ++index,
        argument,
      );
    } else if (argument === "--account-id") {
      options.accountId = requireArgumentValue(argv, ++index, argument);
    } else if (argument === "--index") {
      options.indexName = requireArgumentValue(argv, ++index, argument);
    } else if (argument === "--corpus") {
      options.corpusFile = resolve(
        requireArgumentValue(argv, ++index, argument),
      );
    } else if (argument === "--receipt") {
      options.receiptFile = resolve(
        requireArgumentValue(argv, ++index, argument),
      );
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

function requireArgumentValue(argv, index, option) {
  const value = argv[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value.`);
  }
  return value;
}

function isDirectExecution() {
  if (!process.argv[1]) return false;
  return (
    resolve(process.argv[1]).toLowerCase() ===
    fileURLToPath(import.meta.url).toLowerCase()
  );
}

if (isDirectExecution()) {
  await syncVectorize(parseArguments(process.argv.slice(2)));
}
