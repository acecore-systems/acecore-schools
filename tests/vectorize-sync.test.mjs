import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  SEARCH_EMBEDDING_DIMENSIONS,
  SEARCH_REQUIRED_SOURCE_PATHS,
  calculateSearchChunkDigest,
  calculateSearchCorpusVersion,
} from "../scripts/build-search-corpus.mjs";
import {
  PREVIEW_INDEX_NAME,
  PRODUCTION_INDEX_NAME,
  extractEmbeddingData,
  syncVectorize,
  validateCorpus,
} from "../scripts/sync-vectorize.mjs";

const embedding = Array.from(
  { length: SEARCH_EMBEDDING_DIMENSIONS },
  () => 0.01,
);

function vectorId(index) {
  return `schools-v2-${index.toString(16).padStart(48, "0")}`;
}

function v1VectorId(index) {
  return `schools-v1-${index.toString(16).padStart(48, "0")}`;
}

function createCorpus({ vectorCount = 6 } = {}) {
  const sourceUrls = [...SEARCH_REQUIRED_SOURCE_PATHS];
  while (sourceUrls.length < vectorCount) {
    sourceUrls.push(`/extra-${sourceUrls.length + 1}/`);
  }
  const chunks = Array.from({ length: vectorCount }, (_, index) => {
    const url = sourceUrls[index % sourceUrls.length];
    const chunk = {
      id: vectorId(index + 1),
      namespace: "ja",
      text: `Schools検索用の公開本文 ${index + 1}`,
      metadata: {
        url,
        title: `公開ページ ${index + 1}`,
        section: `セクション ${index + 1}`,
        excerpt: `公開情報の短い抜粋 ${index + 1}`,
        contentType: url === "/" ? "home" : "page",
        locale: "ja",
      },
    };
    chunk.metadata.contentDigest = calculateSearchChunkDigest(chunk);
    return chunk;
  });
  const version = calculateSearchCorpusVersion(chunks);
  return {
    schemaVersion: 1,
    version,
    embedding: {
      model: "@cf/baai/bge-m3",
      dimensions: SEARCH_EMBEDDING_DIMENSIONS,
      metric: "cosine",
    },
    chunking: {
      targetCharacters: 850,
      maximumCharacters: 1200,
      overlapCharacters: 120,
    },
    sourceCount: sourceUrls.length,
    sourceUrls,
    vectorCount: chunks.length,
    localeCounts: { ja: chunks.length },
    chunks,
  };
}

async function writeCorpusFile(corpus) {
  const directory = await mkdtemp(join(tmpdir(), "schools-vectorize-sync-"));
  const corpusFile = join(directory, "corpus.json");
  await writeFile(corpusFile, JSON.stringify(corpus), "utf8");
  return { corpusFile, directory };
}

function cloudflareResponse(result, status = 200) {
  return Response.json(
    status >= 400
      ? {
          success: false,
          errors: [{ message: String(result) }],
        }
      : { success: true, result },
    { status },
  );
}

function createSyncFetch(
  initialIds,
  expectedIds,
  { dimensions = 1024, existingChunks = [] } = {},
) {
  const currentIds = new Set(initialIds);
  const currentVectors = new Map(
    existingChunks.map((chunk) => [
      chunk.id,
      {
        id: chunk.id,
        namespace: chunk.namespace,
        metadata: structuredClone(chunk.metadata),
      },
    ]),
  );
  const calls = [];
  let lastMutationId = "";

  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init });
    const parsedUrl = new URL(url);

    if (
      parsedUrl.pathname.endsWith(
        `/vectorize/v2/indexes/${PREVIEW_INDEX_NAME}`,
      ) &&
      (init.method || "GET") === "GET"
    ) {
      return cloudflareResponse({
        config: { dimensions, metric: "cosine" },
      });
    }

    if (
      parsedUrl.pathname.endsWith(
        `/vectorize/v2/indexes/${PREVIEW_INDEX_NAME}/list`,
      )
    ) {
      assert.equal(parsedUrl.searchParams.has("namespace"), false);
      return cloudflareResponse({
        vectors: [...currentIds].map((id) => ({ id })),
        isTruncated: false,
      });
    }

    if (
      parsedUrl.pathname.endsWith(
        `/vectorize/v2/indexes/${PREVIEW_INDEX_NAME}/get_by_ids`,
      )
    ) {
      const ids = JSON.parse(init.body).ids;
      return cloudflareResponse(
        ids
          .filter((id) => currentIds.has(id))
          .map(
            (id) =>
              currentVectors.get(id) || {
                id,
                namespace: "ja",
                metadata: {},
              },
          ),
      );
    }

    if (parsedUrl.pathname.endsWith("/ai/run/@cf/baai/bge-m3")) {
      const input = JSON.parse(init.body);
      return cloudflareResponse({
        data: input.text.map(() => embedding),
      });
    }

    if (
      parsedUrl.pathname.endsWith(
        `/vectorize/v2/indexes/${PREVIEW_INDEX_NAME}/upsert`,
      )
    ) {
      const ndjson = await init.body.get("vectors").text();
      for (const line of ndjson.trim().split("\n")) {
        const vector = JSON.parse(line);
        currentIds.add(vector.id);
        currentVectors.set(vector.id, vector);
      }
      lastMutationId = "upsert-mutation";
      return cloudflareResponse({ mutationId: lastMutationId });
    }

    if (
      parsedUrl.pathname.endsWith(
        `/vectorize/v2/indexes/${PREVIEW_INDEX_NAME}/delete_by_ids`,
      )
    ) {
      for (const id of JSON.parse(init.body).ids) {
        currentIds.delete(id);
        currentVectors.delete(id);
      }
      lastMutationId = "delete-mutation";
      return cloudflareResponse({ mutationId: lastMutationId });
    }

    if (
      parsedUrl.pathname.endsWith(
        `/vectorize/v2/indexes/${PREVIEW_INDEX_NAME}/info`,
      )
    ) {
      return cloudflareResponse({ processedUpToMutation: lastMutationId });
    }

    throw new Error(`Unexpected Cloudflare request: ${url}`);
  };

  return {
    calls,
    fetchImpl,
    currentIds,
    assertConverged() {
      assert.deepEqual(currentIds, new Set(expectedIds));
    },
  };
}

test("Schools用のja corpusを検証する", () => {
  assert.doesNotThrow(() => validateCorpus(createCorpus()));
});

test("source/vector最低件数と必須routeを検証する", () => {
  const tooFewVectors = createCorpus();
  tooFewVectors.vectorCount = 5;
  tooFewVectors.chunks = tooFewVectors.chunks.slice(0, 5);
  tooFewVectors.localeCounts.ja = 5;
  assert.throws(() => validateCorpus(tooFewVectors), /between 6 and 500/u);

  const missingRoute = createCorpus();
  missingRoute.sourceUrls = missingRoute.sourceUrls.filter(
    (url) => url !== "/faq/",
  );
  missingRoute.sourceUrls.push("/other/");
  assert.throws(() => validateCorpus(missingRoute), /missing required/u);
});

test("ja以外、重複ID、改変versionを拒否する", () => {
  const wrongNamespace = createCorpus();
  wrongNamespace.chunks[0].namespace = "en";
  assert.throws(() => validateCorpus(wrongNamespace), /invalid chunk/u);

  const duplicateId = createCorpus();
  duplicateId.chunks[1].id = duplicateId.chunks[0].id;
  assert.throws(() => validateCorpus(duplicateId), /Duplicate vector id/u);

  const wrongVersion = createCorpus();
  wrongVersion.version = "0".repeat(20);
  assert.throws(() => validateCorpus(wrongVersion), /version/u);
});

test("embedding件数と1024次元を検証する", () => {
  assert.deepEqual(extractEmbeddingData({ data: [embedding] }, 1), [embedding]);
  assert.throws(
    () => extractEmbeddingData({ data: [[0.1]] }, 1),
    /1024 finite values/u,
  );
  assert.throws(
    () => extractEmbeddingData({ data: [] }, 1),
    /returned 0 embeddings/u,
  );
});

test("dry-runは認証なしでcorpusとindex allowlistを検証する", async (t) => {
  const { corpusFile, directory } = await writeCorpusFile(createCorpus());
  t.after(() => rm(directory, { recursive: true, force: true }));
  const logs = [];

  const result = await syncVectorize({
    corpusFile,
    dryRun: true,
    indexName: PREVIEW_INDEX_NAME,
    logger: { log: (value) => logs.push(value) },
  });
  assert.equal(result.dryRun, true);
  assert.equal(result.sources, 6);
  assert.equal(result.vectors, 6);
  assert.equal(logs.length, 1);

  await assert.rejects(
    syncVectorize({
      corpusFile,
      dryRun: true,
      indexName: "other-project-index",
    }),
    /must be one of/u,
  );
});

test("存在しないindexを同期処理から暗黙作成しない", async (t) => {
  const { corpusFile, directory } = await writeCorpusFile(createCorpus());
  t.after(() => rm(directory, { recursive: true, force: true }));
  const calls = [];

  await assert.rejects(
    syncVectorize({
      accountId: "account",
      apiToken: "token",
      indexName: PREVIEW_INDEX_NAME,
      corpusFile,
      fetchImpl: async (url, init = {}) => {
        calls.push({ url, init });
        return cloudflareResponse("not found", 404);
      },
      logger: { log: () => {} },
    }),
    /does not exist/u,
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.method, undefined);
});

test("production同期には明示確認が必要", async (t) => {
  const corpus = createCorpus();
  const { corpusFile, directory } = await writeCorpusFile(corpus);
  t.after(() => rm(directory, { recursive: true, force: true }));

  for (const confirmProductionVersion of [undefined, "0".repeat(20)]) {
    await assert.rejects(
      syncVectorize({
        accountId: "account",
        apiToken: "token",
        indexName: PRODUCTION_INDEX_NAME,
        corpusFile,
        confirmProductionVersion,
        fetchImpl: async () => {
          throw new Error("must not fetch");
        },
      }),
      /Production sync requires/u,
    );
  }

  let requests = 0;
  await assert.rejects(
    syncVectorize({
      accountId: "account",
      apiToken: "token",
      indexName: PRODUCTION_INDEX_NAME,
      corpusFile,
      confirmProductionVersion: corpus.version,
      fetchImpl: async () => {
        requests += 1;
        return cloudflareResponse("not found", 404);
      },
      logger: { log: () => {} },
    }),
    /does not exist/u,
  );
  assert.equal(requests, 1);
});

test("全corpusを再embedding・upsertし、古いIDを削除して収束確認する", async (t) => {
  const corpus = createCorpus();
  const { corpusFile, directory } = await writeCorpusFile(corpus);
  t.after(() => rm(directory, { recursive: true, force: true }));
  const expectedIds = corpus.chunks.map(({ id }) => id);
  const staleId = vectorId(99);
  const mock = createSyncFetch(
    [...expectedIds.slice(0, -1), staleId],
    expectedIds,
  );

  const result = await syncVectorize({
    accountId: "account",
    apiToken: "token",
    indexName: PREVIEW_INDEX_NAME,
    corpusFile,
    fetchImpl: mock.fetchImpl,
    sleepImpl: async () => {},
    mutationPollIntervalMs: 0,
    logger: { log: () => {} },
  });

  assert.equal(result.upserted, 6);
  assert.equal(result.deleted, 1);
  assert.equal(result.mutationId, "delete-mutation");
  mock.assertConverged();
  assert.ok(mock.calls.some(({ url }) => url.endsWith("/upsert")));
  assert.ok(mock.calls.some(({ url }) => url.endsWith("/delete_by_ids")));
  assert.ok(mock.calls.some(({ url }) => url.endsWith("/info")));
});

test("本文digestが一致するcorpusはmutationせず成功receiptを残す", async (t) => {
  const corpus = createCorpus();
  const { corpusFile, directory } = await writeCorpusFile(corpus);
  const receiptFile = join(directory, "receipt.json");
  t.after(() => rm(directory, { recursive: true, force: true }));
  const expectedIds = corpus.chunks.map(({ id }) => id);
  const mock = createSyncFetch(expectedIds, expectedIds, {
    existingChunks: corpus.chunks,
  });

  const result = await syncVectorize({
    accountId: "account",
    apiToken: "token",
    indexName: PREVIEW_INDEX_NAME,
    corpusFile,
    receiptFile,
    fetchImpl: mock.fetchImpl,
    logger: { log: () => {} },
  });

  assert.equal(result.noop, true);
  assert.equal(result.upserted, 0);
  assert.equal(result.mutationId, null);
  assert.equal(
    mock.calls.some(({ url }) => url.endsWith("/ai/run/@cf/baai/bge-m3")),
    false,
  );
  assert.equal(
    mock.calls.some(({ url }) => url.endsWith("/upsert")),
    false,
  );

  const receipt = JSON.parse(await readFile(receiptFile, "utf8"));
  assert.equal(receipt.status, "success");
  assert.equal(receipt.target.corpusVersion, corpus.version);
  assert.equal(receipt.result.noop, true);
  assert.match(receipt.completedAt, /^\d{4}-\d{2}-\d{2}T/u);
});

test("失敗時もtokenを含まないfailure receiptを残す", async (t) => {
  const corpus = createCorpus();
  const { corpusFile, directory } = await writeCorpusFile(corpus);
  const receiptFile = join(directory, "receipt.json");
  t.after(() => rm(directory, { recursive: true, force: true }));

  await assert.rejects(
    syncVectorize({
      accountId: "account",
      apiToken: "secret-token-value",
      indexName: PRODUCTION_INDEX_NAME,
      corpusFile,
      receiptFile,
      fetchImpl: async () => {
        throw new Error("must not fetch");
      },
    }),
    /Production sync requires/u,
  );

  const receiptText = await readFile(receiptFile, "utf8");
  const receipt = JSON.parse(receiptText);
  assert.equal(receipt.status, "failure");
  assert.match(receipt.error.message, /Production sync requires/u);
  assert.equal(receiptText.includes("secret-token-value"), false);
});

test("20%超削除はv1からv2への限定migrationだけ許可する", async (t) => {
  const corpus = createCorpus();
  const { corpusFile, directory } = await writeCorpusFile(corpus);
  t.after(() => rm(directory, { recursive: true, force: true }));
  const expectedIds = corpus.chunks.map(({ id }) => id);
  const v1Ids = expectedIds.map((_, index) => v1VectorId(index + 1));

  const blocked = createSyncFetch(v1Ids, expectedIds);
  await assert.rejects(
    syncVectorize({
      accountId: "account",
      apiToken: "token",
      indexName: PREVIEW_INDEX_NAME,
      corpusFile,
      fetchImpl: blocked.fetchImpl,
      logger: { log: () => {} },
    }),
    /only the reviewed --migrate-v1-to-v2 path/u,
  );

  const migration = createSyncFetch(v1Ids, expectedIds);
  const result = await syncVectorize({
    accountId: "account",
    apiToken: "token",
    indexName: PREVIEW_INDEX_NAME,
    corpusFile,
    allowV1ToV2Migration: true,
    fetchImpl: migration.fetchImpl,
    sleepImpl: async () => {},
    mutationPollIntervalMs: 0,
    logger: { log: () => {} },
  });
  assert.equal(result.deleted, v1Ids.length);
  migration.assertConverged();

  const unsafeV2Delete = createSyncFetch(
    [...expectedIds, vectorId(98), vectorId(99)],
    expectedIds,
  );
  await assert.rejects(
    syncVectorize({
      accountId: "account",
      apiToken: "token",
      indexName: PREVIEW_INDEX_NAME,
      corpusFile,
      allowV1ToV2Migration: true,
      fetchImpl: unsafeV2Delete.fetchImpl,
      logger: { log: () => {} },
    }),
    /only the reviewed --migrate-v1-to-v2 path/u,
  );
});

test("管理外ID、20%超削除、index設定不一致では変更前に停止する", async (t) => {
  const corpus = createCorpus();
  const { corpusFile, directory } = await writeCorpusFile(corpus);
  t.after(() => rm(directory, { recursive: true, force: true }));
  const expectedIds = corpus.chunks.map(({ id }) => id);

  const unmanaged = createSyncFetch(
    [...expectedIds, "another-project-vector"],
    expectedIds,
  );
  await assert.rejects(
    syncVectorize({
      accountId: "account",
      apiToken: "token",
      indexName: PREVIEW_INDEX_NAME,
      corpusFile,
      fetchImpl: unmanaged.fetchImpl,
      logger: { log: () => {} },
    }),
    /unmanaged vector id/u,
  );

  const largeDelete = createSyncFetch(
    [...expectedIds, vectorId(98), vectorId(99)],
    expectedIds,
  );
  await assert.rejects(
    syncVectorize({
      accountId: "account",
      apiToken: "token",
      indexName: PREVIEW_INDEX_NAME,
      corpusFile,
      fetchImpl: largeDelete.fetchImpl,
      logger: { log: () => {} },
    }),
    /Refusing to delete 2\/8 vectors/u,
  );

  const wrongDimensions = createSyncFetch(expectedIds, expectedIds, {
    dimensions: 768,
  });
  await assert.rejects(
    syncVectorize({
      accountId: "account",
      apiToken: "token",
      indexName: PREVIEW_INDEX_NAME,
      corpusFile,
      fetchImpl: wrongDimensions.fetchImpl,
      logger: { log: () => {} },
    }),
    /must use 1024 dimensions/u,
  );
});
