const EMBEDDING_MODEL = "@cf/baai/bge-m3";
const EMBEDDING_DIMENSIONS = 1024;
const SEARCH_LOCALE = "ja";
const DEFAULT_MIN_SCORE = 0.5;
const MAX_REQUEST_BYTES = 2048;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 160;
const QUERY_TOP_K = 15;
const RESULT_LIMIT = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_RETENTION_SECONDS = 600;
const SEARCH_METRIC_RETENTION_SECONDS = 90 * 24 * 60 * 60;
const CLIENT_RATE_LIMIT = 10;
const GLOBAL_RATE_LIMIT = 20;
const CLIENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type SearchPayload = {
  query?: unknown;
  locale?: unknown;
};

type SearchMetadata = {
  url: string;
  title: string;
  section: string;
  excerpt: string;
  contentType: string;
  locale: string;
};

type SearchResult = {
  id: string;
  url: string;
  title: string;
  section: string;
  excerpt: string;
  contentType: string;
  rank: number;
};

type SearchOutcome =
  | "success"
  | "client_error"
  | "rate_limited"
  | "unavailable"
  | "provider_error"
  | "internal_error";

type SearchStage =
  | "request"
  | "origin"
  | "content_type"
  | "availability"
  | "rate_limit"
  | "payload"
  | "embedding"
  | "vectorize"
  | "complete";

type SearchCompletion = {
  outcome: SearchOutcome;
  stage: SearchStage;
  status: number;
  resultCount: number;
};

export const onRequestPost: PagesFunction<CloudflareEnv> = async (context) => {
  const { request, env } = context;
  const startedAt = performance.now();
  const requestId = crypto.randomUUID();
  let metricDatabase: D1Database | undefined;
  let completion: SearchCompletion = {
    outcome: "internal_error",
    stage: "request",
    status: 500,
    resultCount: 0,
  };

  try {
    if (request.method !== "POST") {
      completion = {
        outcome: "client_error",
        stage: "request",
        status: 405,
        resultCount: 0,
      };
      return errorResponse("method_not_allowed", 405, requestId, startedAt, {
        Allow: "POST",
      });
    }

    if (!isSameOriginRequest(request)) {
      completion = {
        outcome: "client_error",
        stage: "origin",
        status: 403,
        resultCount: 0,
      };
      return errorResponse("forbidden", 403, requestId, startedAt);
    }

    if (!isJsonContentType(request.headers.get("Content-Type"))) {
      completion = {
        outcome: "client_error",
        stage: "content_type",
        status: 415,
        resultCount: 0,
      };
      return errorResponse("unsupported_media_type", 415, requestId, startedAt);
    }

    const ai = env.AI;
    const searchIndex = env.SEARCH_INDEX;
    const rateLimitDatabase = env.SEARCH_RATE_LIMIT_DB;
    const rateLimitSecret = env.SEARCH_RATE_LIMIT_SECRET;
    if (
      env.SEARCH_ENABLED !== "true" ||
      !ai ||
      !searchIndex ||
      !rateLimitDatabase ||
      typeof rateLimitSecret !== "string" ||
      rateLimitSecret.length < 32
    ) {
      completion = {
        outcome: "unavailable",
        stage: "availability",
        status: 503,
        resultCount: 0,
      };
      return errorResponse("unavailable", 503, requestId, startedAt);
    }

    let rateLimitAllowed = false;
    try {
      const clientKey = await createClientRateLimitKey(
        request,
        rateLimitSecret,
      );
      rateLimitAllowed = await consumeRateLimits(
        rateLimitDatabase,
        `client:${clientKey}`,
      );
    } catch (error) {
      logSearchError(
        requestId,
        "rate_limit",
        getErrorCode(error, "storage_error"),
      );
      completion = {
        outcome: "unavailable",
        stage: "rate_limit",
        status: 503,
        resultCount: 0,
      };
      return errorResponse("unavailable", 503, requestId, startedAt);
    }

    if (!rateLimitAllowed) {
      completion = {
        outcome: "rate_limited",
        stage: "rate_limit",
        status: 429,
        resultCount: 0,
      };
      return errorResponse("rate_limited", 429, requestId, startedAt, {
        "Retry-After": String(RATE_LIMIT_WINDOW_SECONDS),
      });
    }

    metricDatabase = rateLimitDatabase;

    context.waitUntil(
      deleteExpiredRateLimits(rateLimitDatabase).catch((error) => {
        logSearchError(
          requestId,
          "rate_limit_cleanup",
          getErrorCode(error, "storage_error"),
        );
      }),
    );

    const requestText = await readBoundedRequestText(
      request,
      MAX_REQUEST_BYTES,
    );
    if (requestText === null) {
      completion = {
        outcome: "client_error",
        stage: "payload",
        status: 413,
        resultCount: 0,
      };
      return errorResponse("request_too_large", 413, requestId, startedAt);
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(requestText);
    } catch {
      completion = {
        outcome: "client_error",
        stage: "payload",
        status: 400,
        resultCount: 0,
      };
      return errorResponse("invalid_json", 400, requestId, startedAt);
    }
    if (!isJsonObject(parsedPayload)) {
      completion = {
        outcome: "client_error",
        stage: "payload",
        status: 400,
        resultCount: 0,
      };
      return errorResponse("invalid_request", 400, requestId, startedAt);
    }

    const payload = parsedPayload as SearchPayload;
    const query = normalizeQuery(payload.query);
    const locale = normalizeLocale(payload.locale);
    if (!query || !locale) {
      completion = {
        outcome: "client_error",
        stage: "payload",
        status: 400,
        resultCount: 0,
      };
      return errorResponse("invalid_request", 400, requestId, startedAt);
    }

    let embeddingResult: unknown;
    try {
      embeddingResult = await ai.run(EMBEDDING_MODEL, {
        text: [query],
        truncate_inputs: true,
      });
    } catch (error) {
      logSearchError(
        requestId,
        "embedding",
        getErrorCode(error, "provider_error"),
      );
      completion = {
        outcome: "provider_error",
        stage: "embedding",
        status: 502,
        resultCount: 0,
      };
      return errorResponse("provider_error", 502, requestId, startedAt);
    }

    const embedding = extractEmbedding(embeddingResult);
    if (!embedding) {
      logSearchError(requestId, "embedding", "invalid_embedding");
      completion = {
        outcome: "provider_error",
        stage: "embedding",
        status: 502,
        resultCount: 0,
      };
      return errorResponse("provider_error", 502, requestId, startedAt);
    }

    let matches: VectorizeMatches;
    try {
      matches = await searchIndex.query(embedding, {
        namespace: SEARCH_LOCALE,
        topK: QUERY_TOP_K,
        returnMetadata: "all",
        returnValues: false,
      });
    } catch (error) {
      logSearchError(
        requestId,
        "vectorize",
        getErrorCode(error, "provider_error"),
      );
      completion = {
        outcome: "provider_error",
        stage: "vectorize",
        status: 502,
        resultCount: 0,
      };
      return errorResponse("provider_error", 502, requestId, startedAt);
    }

    const minScore = normalizeMinScore(env.SEARCH_MIN_SCORE);
    const results = normalizeMatches(
      matches,
      minScore,
      request.url,
      SEARCH_LOCALE,
    );

    completion = {
      outcome: "success",
      stage: "complete",
      status: 200,
      resultCount: results.length,
    };
    return jsonResponse(
      {
        ok: true,
        requestId,
        results,
      },
      200,
      requestId,
      startedAt,
    );
  } catch (error) {
    logSearchError(
      requestId,
      "request",
      error instanceof Error ? error.name : "unknown_error",
    );
    completion = {
      outcome: "internal_error",
      stage: "request",
      status: 500,
      resultCount: 0,
    };
    return errorResponse("internal_error", 500, requestId, startedAt);
  } finally {
    recordSearchCompletion(
      context,
      metricDatabase,
      requestId,
      startedAt,
      completion,
    );
  }
};

function normalizeQuery(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const query = value.normalize("NFKC").replace(/\s+/gu, " ").trim();
  const length = [...query].length;
  return length >= MIN_QUERY_LENGTH && length <= MAX_QUERY_LENGTH
    ? query
    : null;
}

function normalizeLocale(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim().toLowerCase() === SEARCH_LOCALE ? SEARCH_LOCALE : null;
}

function normalizeClientId(value: string | null): string {
  const clientId = String(value || "").trim();
  return CLIENT_ID_PATTERN.test(clientId) ? clientId : "anonymous";
}

function isJsonContentType(value: string | null): boolean {
  return value?.split(";", 1)[0]?.trim().toLowerCase() === "application/json";
}

async function readBoundedRequestText(
  request: Request,
  maxBytes: number,
): Promise<string | null> {
  const declaredLength = request.headers.get("Content-Length");
  if (declaredLength !== null) {
    const length = Number(declaredLength);
    if (!Number.isSafeInteger(length) || length < 0 || length > maxBytes) {
      return null;
    }
  }

  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maxBytes) {
        await reader.cancel("request body too large").catch(() => undefined);
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function createClientRateLimitKey(
  request: Request,
  secret: string,
): Promise<string> {
  const connectingIp = String(
    request.headers.get("CF-Connecting-IP") || "",
  ).trim();
  const source =
    connectingIp && connectingIp.length <= 64
      ? `ip:${connectingIp}`
      : `session:${normalizeClientId(
          request.headers.get("X-Acecore-Search-Client"),
        )}`;
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    new TextEncoder().encode(source),
  );
  return Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}

async function consumeRateLimits(
  database: D1Database,
  clientLimiterKey: string,
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart =
    Math.floor(now / RATE_LIMIT_WINDOW_SECONDS) * RATE_LIMIT_WINDOW_SECONDS;
  const result = await database
    .prepare(
      `WITH current_counts AS (
         SELECT
           COALESCE(
             MAX(CASE WHEN limiter_key = ?1 THEN request_count END),
             0
           ) AS client_count,
           COALESCE(
             MAX(CASE WHEN limiter_key = 'global' THEN request_count END),
             0
           ) AS global_count
         FROM semantic_search_rate_limits
         WHERE window_start = ?2
           AND limiter_key IN (?1, 'global')
       ),
       eligible AS (
         SELECT 1 AS allowed
         FROM current_counts
         WHERE client_count < ?4
           AND global_count < ?5
       )
       INSERT INTO semantic_search_rate_limits
        (limiter_key, window_start, request_count, expires_at)
       SELECT ?1, ?2, 1, ?3
       FROM eligible
       WHERE allowed = 1
       UNION ALL
       SELECT 'global', ?2, 1, ?3
       FROM eligible
       WHERE allowed = 1
       ON CONFLICT (limiter_key, window_start) DO UPDATE SET
         request_count = semantic_search_rate_limits.request_count + 1
       RETURNING limiter_key, request_count`,
    )
    .bind(
      clientLimiterKey,
      windowStart,
      now + RATE_LIMIT_RETENTION_SECONDS,
      CLIENT_RATE_LIMIT,
      GLOBAL_RATE_LIMIT,
    )
    .all<{ limiter_key: string; request_count: number }>();

  const counts = new Map(
    result.results.map(({ limiter_key, request_count }) => [
      limiter_key,
      request_count,
    ]),
  );
  const clientCount = counts.get(clientLimiterKey);
  const globalCount = counts.get("global");

  return (
    result.results.length === 2 &&
    Number.isInteger(clientCount) &&
    Number(clientCount) <= CLIENT_RATE_LIMIT &&
    Number.isInteger(globalCount) &&
    Number(globalCount) <= GLOBAL_RATE_LIMIT
  );
}

async function deleteExpiredRateLimits(database: D1Database): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await database
    .prepare("DELETE FROM semantic_search_rate_limits WHERE expires_at < ?1")
    .bind(now)
    .run();
}

function recordSearchCompletion(
  context: EventContext<CloudflareEnv, string, unknown>,
  database: D1Database | undefined,
  requestId: string,
  startedAt: number,
  completion: SearchCompletion,
): void {
  const durationMs = Math.max(0, Math.round(performance.now() - startedAt));
  const zeroResults =
    completion.outcome === "success" && completion.resultCount === 0;

  console.log(
    JSON.stringify({
      event: "semantic_search_completed",
      requestId,
      locale: SEARCH_LOCALE,
      outcome: completion.outcome,
      stage: completion.stage,
      status: completion.status,
      resultCount: completion.resultCount,
      zeroResults,
      durationMs,
    }),
  );

  if (!database) return;

  try {
    context.waitUntil(
      persistSearchMetric(database, completion, durationMs).catch((error) => {
        logSearchError(
          requestId,
          "metrics",
          getErrorCode(error, "storage_error"),
        );
      }),
    );
  } catch (error) {
    logSearchError(requestId, "metrics", getErrorCode(error, "storage_error"));
  }
}

async function persistSearchMetric(
  database: D1Database,
  completion: SearchCompletion,
  durationMs: number,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const hourStart = Math.floor(now / 3600) * 3600;
  const zeroResultCount =
    completion.outcome === "success" && completion.resultCount === 0 ? 1 : 0;

  await database
    .prepare(
      `INSERT INTO semantic_search_metrics
        (hour_start, outcome, stage, status, request_count, zero_result_count,
         result_count_total, latency_ms_total, latency_ms_max, expires_at)
       VALUES (?1, ?2, ?3, ?4, 1, ?5, ?6, ?7, ?7, ?8)
       ON CONFLICT (hour_start, outcome, stage, status) DO UPDATE SET
         request_count = semantic_search_metrics.request_count + 1,
         zero_result_count =
           semantic_search_metrics.zero_result_count + excluded.zero_result_count,
         result_count_total =
           semantic_search_metrics.result_count_total + excluded.result_count_total,
         latency_ms_total =
           semantic_search_metrics.latency_ms_total + excluded.latency_ms_total,
         latency_ms_max =
           MAX(semantic_search_metrics.latency_ms_max, excluded.latency_ms_max)`,
    )
    .bind(
      hourStart,
      completion.outcome,
      completion.stage,
      completion.status,
      zeroResultCount,
      completion.resultCount,
      durationMs,
      now + SEARCH_METRIC_RETENTION_SECONDS,
    )
    .run();

  await deleteExpiredSearchMetrics(database, now);
}

async function deleteExpiredSearchMetrics(
  database: D1Database,
  now: number,
): Promise<void> {
  await database
    .prepare("DELETE FROM semantic_search_metrics WHERE expires_at < ?1")
    .bind(now)
    .run();
}

function normalizeMinScore(value: string | undefined): number {
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 1
    ? score
    : DEFAULT_MIN_SCORE;
}

function extractEmbedding(result: unknown): number[] | null {
  if (!result || typeof result !== "object") return null;
  const data = (result as { data?: unknown }).data;
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;

  const values = data[0];
  if (
    values.length !== EMBEDDING_DIMENSIONS ||
    values.some((value) => typeof value !== "number" || !Number.isFinite(value))
  ) {
    return null;
  }

  return values;
}

function normalizeMatches(
  queryResult: VectorizeMatches,
  minScore: number,
  requestUrl: string,
  locale: string,
): SearchResult[] {
  const results: SearchResult[] = [];
  const seenUrls = new Set<string>();

  for (const match of queryResult.matches) {
    if (!Number.isFinite(match.score) || match.score < minScore) continue;
    const metadata = normalizeMetadata(match.metadata, requestUrl, locale);
    if (!metadata || seenUrls.has(metadata.url)) continue;

    seenUrls.add(metadata.url);
    results.push({
      id: match.id,
      url: metadata.url,
      title: metadata.title,
      section: metadata.section,
      excerpt: metadata.excerpt,
      contentType: metadata.contentType,
      rank: results.length + 1,
    });
    if (results.length >= RESULT_LIMIT) break;
  }

  return results;
}

function normalizeMetadata(
  value: unknown,
  requestUrl: string,
  expectedLocale: string,
): SearchMetadata | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const metadata = value as Record<string, unknown>;

  const url = readString(metadata.url, 500);
  const title = readString(metadata.title, 240);
  const section = readString(metadata.section, 240) || title;
  const excerpt = readString(metadata.excerpt, 500);
  const contentType = readString(metadata.contentType, 40) || "page";
  const locale = readString(metadata.locale, 16);
  if (
    !url ||
    !title ||
    locale !== expectedLocale ||
    !url.startsWith("/") ||
    url.startsWith("//")
  ) {
    return null;
  }

  try {
    const requestOrigin = new URL(requestUrl).origin;
    const resolved = new URL(url, requestOrigin);
    if (resolved.origin !== requestOrigin) return null;
  } catch {
    return null;
  }

  return { url, title, section, excerpt, contentType, locale };
}

function getErrorCode(error: unknown, fallback: string): string {
  return error instanceof Error && error.name ? error.name : fallback;
}

function readString(value: unknown, maxLength: number): string {
  return typeof value === "string"
    ? value.normalize("NFKC").trim().slice(0, maxLength)
    : "";
}

function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function errorResponse(
  code: string,
  status: number,
  requestId: string,
  startedAt: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return jsonResponse(
    { ok: false, error: { code }, requestId },
    status,
    requestId,
    startedAt,
    extraHeaders,
  );
}

function jsonResponse(
  body: unknown,
  status: number,
  requestId: string,
  startedAt: number,
  extraHeaders: Record<string, string> = {},
): Response {
  const duration = Math.max(0, performance.now() - startedAt).toFixed(1);
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Server-Timing": `search;dur=${duration}`,
      "X-Content-Type-Options": "nosniff",
      "X-Search-Request-Id": requestId,
      ...extraHeaders,
    },
  });
}

function logSearchError(
  requestId: string,
  stage: string,
  errorCode: string,
): void {
  console.error(
    JSON.stringify({
      event: "semantic_search_error",
      requestId,
      locale: SEARCH_LOCALE,
      stage,
      errorCode,
    }),
  );
}
