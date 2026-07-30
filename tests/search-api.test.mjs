import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";

import { onRequestPost } from "../functions/api/search.ts";

const queryVector = Array.from({ length: 1024 }, () => 0.01);

test("同一originの日本語検索だけをja namespaceで問い合わせる", async () => {
  let queryOptions;
  const env = createEnv({
    matches: [
      {
        id: "one",
        score: 0.81,
        metadata: {
          url: "/learning/#programming",
          title: "学べること",
          section: "IT学習・プログラミング",
          excerpt: "Web制作や小さなツールの公開を目指します。",
          contentType: "page",
          locale: "ja",
        },
      },
      {
        id: "duplicate-url",
        score: 0.79,
        metadata: {
          url: "/learning/#programming",
          title: "学べること",
          section: "プログラミング",
          excerpt: "同じURLの別チャンクです。",
          contentType: "page",
          locale: "ja",
        },
      },
      {
        id: "too-low",
        score: 0.49,
        metadata: {
          url: "/about/",
          title: "Schoolsについて",
          section: "概要",
          excerpt: "概要",
          contentType: "page",
          locale: "ja",
        },
      },
    ],
    onQuery(_values, options) {
      queryOptions = options;
    },
  });

  const response = await onRequestPost({
    request: searchRequest({
      query: "プログラミングを実践で学びたい",
      locale: "ja",
    }),
    env,
    waitUntil() {},
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.match(response.headers.get("Server-Timing"), /^search;dur=/);
  assert.equal(body.results.length, 1);
  assert.equal(body.results[0].url, "/learning/#programming");
  assert.equal(body.results[0].rank, 1);
  assert.deepEqual(queryOptions, {
    namespace: "ja",
    topK: 15,
    returnMetadata: "all",
    returnValues: false,
  });
});

test("匿名の完了logとUTC時別metricへ成功・0件・latencyを記録する", async () => {
  const waits = [];
  const metricRows = [];
  const rateLimitCleanupValues = [];
  const metricCleanupValues = [];
  const env = createEnv({
    onMetric(values) {
      metricRows.push(values);
    },
    onRateLimitCleanup(values) {
      rateLimitCleanupValues.push(values);
    },
    onMetricCleanup(values) {
      metricCleanupValues.push(values);
    },
  });
  const request = searchRequest({
    query: "秘密を含む検索テキスト",
    locale: "ja",
  });
  request.headers.set("CF-Connecting-IP", "203.0.113.10");

  const { result: response, logs } = await withCapturedLogs(async () => {
    const result = await onRequestPost({
      request,
      env,
      waitUntil(promise) {
        waits.push(promise);
      },
    });
    await Promise.all(waits);
    return result;
  });

  assert.equal(response.status, 200);
  assert.equal(logs.length, 1);
  const completion = JSON.parse(logs[0]);
  assert.deepEqual(
    Object.keys(completion).sort(),
    [
      "durationMs",
      "event",
      "locale",
      "outcome",
      "requestId",
      "resultCount",
      "stage",
      "status",
      "zeroResults",
    ].sort(),
  );
  assert.equal(completion.event, "semantic_search_completed");
  assert.equal(completion.outcome, "success");
  assert.equal(completion.stage, "complete");
  assert.equal(completion.status, 200);
  assert.equal(completion.resultCount, 0);
  assert.equal(completion.zeroResults, true);
  assert.ok(Number.isInteger(completion.durationMs));
  assert.doesNotMatch(logs[0], /秘密を含む検索テキスト/);
  assert.doesNotMatch(logs[0], /203\.0\.113\.10/);
  assert.doesNotMatch(logs[0], /018f7e5a-7b4d-7c6a-8e9f-0123456789ab/);
  assert.doesNotMatch(logs[0], /[0-9a-f]{64}/i);

  assert.equal(metricRows.length, 1);
  const [
    hourStart,
    outcome,
    stage,
    status,
    zeroResultCount,
    resultCount,
    latencyMs,
    expiresAt,
  ] = metricRows[0];
  assert.equal(hourStart % 3600, 0);
  assert.equal(outcome, "success");
  assert.equal(stage, "complete");
  assert.equal(status, 200);
  assert.equal(zeroResultCount, 1);
  assert.equal(resultCount, 0);
  assert.ok(Number.isInteger(latencyMs));
  assert.ok(expiresAt - hourStart >= 90 * 24 * 60 * 60);
  assert.ok(expiresAt - hourStart < 90 * 24 * 60 * 60 + 3600);
  assert.equal(rateLimitCleanupValues.length, 1);
  assert.equal(rateLimitCleanupValues[0].length, 1);
  assert.equal(metricCleanupValues.length, 1);
  assert.equal(metricCleanupValues[0].length, 1);
  assert.ok(metricCleanupValues[0][0] >= hourStart);
  assert.ok(metricCleanupValues[0][0] < hourStart + 3600);
});

test("rate limit前の拒否も匿名の完了logを1件だけ残す", async () => {
  const request = new Request("https://schools.acecore.net/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: "前段で拒否される秘密の検索",
      locale: "ja",
    }),
  });

  const { result: response, logs } = await withCapturedLogs(() =>
    onRequestPost({
      request,
      env: createEnv(),
      waitUntil() {
        assert.fail("rate limit前の拒否でbackground taskを登録してはいけない");
      },
    }),
  );

  assert.equal(response.status, 403);
  assert.equal(logs.length, 1);
  const completion = JSON.parse(logs[0]);
  assert.equal(completion.outcome, "client_error");
  assert.equal(completion.stage, "origin");
  assert.equal(completion.status, 403);
  assert.doesNotMatch(logs[0], /前段で拒否される秘密の検索/);
});

test("metricはclientとglobal rate limit通過後のrequestだけを記録する", async () => {
  const rejectedMetrics = [];
  const rejectedWaits = [];
  const rejectedResponse = await onRequestPost({
    request: searchRequest({ query: "料金について", locale: "ja" }),
    env: createEnv({
      clientRateLimitSuccess: false,
      onMetric(values) {
        rejectedMetrics.push(values);
      },
    }),
    waitUntil(promise) {
      rejectedWaits.push(promise);
    },
  });
  await Promise.all(rejectedWaits);

  const acceptedMetrics = [];
  const acceptedWaits = [];
  const acceptedResponse = await onRequestPost({
    request: searchRequest("invalid payload"),
    env: createEnv({
      onMetric(values) {
        acceptedMetrics.push(values);
      },
    }),
    waitUntil(promise) {
      acceptedWaits.push(promise);
    },
  });
  await Promise.all(acceptedWaits);

  assert.equal(rejectedResponse.status, 429);
  assert.equal(rejectedMetrics.length, 0);
  assert.equal(acceptedResponse.status, 400);
  assert.equal(acceptedMetrics.length, 1);
  assert.deepEqual(acceptedMetrics[0].slice(1, 6), [
    "client_error",
    "payload",
    400,
    0,
    0,
  ]);
});

test("provider障害も有限outcomeとstageでmetricへ記録する", async () => {
  const waits = [];
  const metricRows = [];
  const response = await withCapturedErrors(() =>
    onRequestPost({
      request: searchRequest({ query: "料金について", locale: "ja" }),
      env: createEnv({
        aiError: new Error("AI unavailable"),
        onMetric(values) {
          metricRows.push(values);
        },
      }),
      waitUntil(promise) {
        waits.push(promise);
      },
    }),
  );
  await Promise.all(waits);

  assert.equal(response.status, 502);
  assert.equal(metricRows.length, 1);
  assert.deepEqual(metricRows[0].slice(1, 6), [
    "provider_error",
    "embedding",
    502,
    0,
    0,
  ]);
});

test("metric永続化の失敗はresponseを変えずdiagnostic logだけを残す", async () => {
  const waits = [];
  const originalError = console.error;
  const errorLogs = [];
  console.error = (value) => errorLogs.push(String(value));

  try {
    const response = await onRequestPost({
      request: searchRequest({ query: "料金について", locale: "ja" }),
      env: createEnv({ metricError: new Error("sensitive D1 detail") }),
      waitUntil(promise) {
        waits.push(promise);
      },
    });
    await Promise.all(waits);

    assert.equal(response.status, 200);
    assert.equal(errorLogs.length, 1);
    assert.match(errorLogs[0], /semantic_search_error/);
    assert.match(errorLogs[0], /"stage":"metrics"/);
    assert.doesNotMatch(errorLogs[0], /sensitive D1 detail/);
  } finally {
    console.error = originalError;
  }
});

test("OriginがないrequestはWorkers AIを呼ばずに拒否する", async () => {
  let aiCalled = false;
  const env = createEnv({
    onAiRun() {
      aiCalled = true;
    },
  });
  const request = new Request("https://schools.acecore.net/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "検索", locale: "ja" }),
  });

  const response = await onRequestPost({ request, env, waitUntil() {} });

  assert.equal(response.status, 403);
  assert.equal(aiCalled, false);
});

test("別originとJSON以外のContent-Typeを拒否する", async () => {
  const crossOriginRequest = searchRequest(
    { query: "料金について", locale: "ja" },
    { Origin: "https://acecore.net" },
  );
  const textRequest = searchRequest(
    { query: "料金について", locale: "ja" },
    { "Content-Type": "text/plain" },
  );

  const crossOriginResponse = await onRequestPost({
    request: crossOriginRequest,
    env: createEnv(),
    waitUntil() {},
  });
  const textResponse = await onRequestPost({
    request: textRequest,
    env: createEnv(),
    waitUntil() {},
  });

  assert.equal(crossOriginResponse.status, 403);
  assert.equal(textResponse.status, 415);
});

test("短すぎるqueryと日本語以外のlocaleを拒否する", async () => {
  const env = createEnv();
  const shortResponse = await onRequestPost({
    request: searchRequest({ query: "a", locale: "ja" }),
    env,
    waitUntil() {},
  });
  const localeResponse = await onRequestPost({
    request: searchRequest({ query: "search", locale: "en" }),
    env,
    waitUntil() {},
  });

  assert.equal(shortResponse.status, 400);
  assert.equal(localeResponse.status, 400);
});

test("JSON nullとprimitiveを400で拒否する", async () => {
  const env = createEnv();
  const nullResponse = await onRequestPost({
    request: searchRequest(null),
    env,
    waitUntil() {},
  });
  const primitiveResponse = await onRequestPost({
    request: searchRequest("search"),
    env,
    waitUntil() {},
  });

  assert.equal(nullResponse.status, 400);
  assert.equal(primitiveResponse.status, 400);
});

test("Content-Lengthが上限を超えるbodyを読み込まず413にする", async () => {
  const env = createEnv();
  const request = new Request("https://schools.acecore.net/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": "4096",
      Origin: "https://schools.acecore.net",
    },
    body: JSON.stringify({ query: "検索", locale: "ja" }),
  });

  const response = await onRequestPost({
    request,
    env,
    waitUntil() {},
  });

  assert.equal(response.status, 413);
  assert.equal(request.bodyUsed, false);
});

test("Content-Lengthがなくても上限までしかbodyを読み込まない", async () => {
  let pulls = 0;
  const chunk = new Uint8Array(1024);
  const body = new ReadableStream({
    pull(controller) {
      pulls += 1;
      controller.enqueue(chunk);
      if (pulls >= 10) controller.close();
    },
  });
  const request = new Request("https://schools.acecore.net/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://schools.acecore.net",
    },
    body,
    duplex: "half",
  });

  const response = await onRequestPost({
    request,
    env: createEnv(),
    waitUntil() {},
  });

  assert.equal(response.status, 413);
  assert.ok(pulls <= 4);
});

test("client rate limit拒否時はclient・globalのどちらも消費せず429を返す", async () => {
  const consumedKeys = [];
  let queryCount = 0;
  const env = createEnv({
    clientRateLimitSuccess: false,
    onRateLimit(key) {
      consumedKeys.push(key);
    },
    onRateLimitQuery() {
      queryCount += 1;
    },
  });
  const response = await onRequestPost({
    request: searchRequest({ query: "料金について", locale: "ja" }),
    env,
    waitUntil() {},
  });

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.equal(consumedKeys.length, 0);
  assert.equal(queryCount, 1);
});

test("global rate limit拒否時は新しいclient keyも書き込まず429を返す", async () => {
  const consumedKeys = [];
  let attemptedClientKey;
  const env = createEnv({
    globalRateLimitSuccess: false,
    onRateLimit(key) {
      consumedKeys.push(key);
    },
    onRateLimitQuery({ clientKey }) {
      attemptedClientKey = clientKey;
    },
  });
  const response = await onRequestPost({
    request: searchRequest({ query: "料金について", locale: "ja" }),
    env,
    waitUntil() {},
  });

  assert.equal(response.status, 429);
  assert.match(attemptedClientKey, /^client:[0-9a-f]{64}$/);
  assert.deepEqual(consumedKeys, []);
});

test("SQLite実行でもclient・globalを原子的に制限し拒否行を作らない", async () => {
  let rateLimitQuery;
  await onRequestPost({
    request: searchRequest({ query: "料金について", locale: "ja" }),
    env: createEnv({
      onRateLimitQuery({ query }) {
        rateLimitQuery = query;
      },
    }),
    waitUntil() {},
  });

  const database = new DatabaseSync(":memory:");
  try {
    database.exec(`
      CREATE TABLE semantic_search_rate_limits (
        limiter_key TEXT NOT NULL,
        window_start INTEGER NOT NULL,
        request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count >= 1),
        expires_at INTEGER NOT NULL,
        PRIMARY KEY (limiter_key, window_start)
      ) WITHOUT ROWID, STRICT;
    `);
    const consume = database.prepare(rateLimitQuery);
    const windowStart = 2_000_000_000;
    const expiresAt = windowStart + 600;

    for (let requestCount = 1; requestCount <= 10; requestCount += 1) {
      const rows = consume.all(
        "client:primary",
        windowStart,
        expiresAt,
        10,
        20,
      );
      assert.equal(rows.length, 2);
    }
    assert.deepEqual(
      consume.all("client:primary", windowStart, expiresAt, 10, 20),
      [],
    );

    for (let index = 0; index < 10; index += 1) {
      const rows = consume.all(
        `client:distributed-${index}`,
        windowStart,
        expiresAt,
        10,
        20,
      );
      assert.equal(rows.length, 2);
    }
    assert.deepEqual(
      consume.all("client:rejected-new", windowStart, expiresAt, 10, 20),
      [],
    );

    const counts = database
      .prepare(
        `SELECT
           COUNT(*) AS row_count,
           MAX(CASE WHEN limiter_key = 'global' THEN request_count END)
             AS global_count,
           SUM(CASE WHEN limiter_key = 'client:rejected-new' THEN 1 ELSE 0 END)
             AS rejected_rows
         FROM semantic_search_rate_limits`,
      )
      .get();
    assert.equal(counts.row_count, 12);
    assert.equal(counts.global_count, 20);
    assert.equal(counts.rejected_rows, 0);
  } finally {
    database.close();
  }
});

test("Cloudflare接続IPをHMAC化したclient keyを自己申告UUIDより優先する", async () => {
  const consumedKeys = [];
  const env = createEnv({
    onRateLimit(key) {
      consumedKeys.push(key);
    },
  });
  const request = searchRequest({ query: "料金について", locale: "ja" });
  request.headers.set("CF-Connecting-IP", "203.0.113.9");

  const response = await onRequestPost({
    request,
    env,
    waitUntil() {},
  });

  assert.equal(response.status, 200);
  assert.equal(consumedKeys.length, 2);
  assert.match(consumedKeys[0], /^client:[0-9a-f]{64}$/);
  assert.equal(consumedKeys[1], "global");
});

test("同じ接続IPでもsecretが異なればclient keyを関連付けられない", async () => {
  const keys = [];
  for (const secret of ["a".repeat(32), "b".repeat(32)]) {
    const request = searchRequest({ query: "料金について", locale: "ja" });
    request.headers.set("CF-Connecting-IP", "203.0.113.9");
    const response = await onRequestPost({
      request,
      env: createEnv({
        rateLimitSecret: secret,
        onRateLimit(key) {
          if (key.startsWith("client:")) keys.push(key);
        },
      }),
      waitUntil() {},
    });
    assert.equal(response.status, 200);
  }

  assert.equal(keys.length, 2);
  assert.notEqual(keys[0], keys[1]);
});

test("rate-limit secretが未設定ならfail closedで503を返す", async () => {
  let rateLimitQueried = false;
  const response = await onRequestPost({
    request: searchRequest({ query: "料金について", locale: "ja" }),
    env: createEnv({
      rateLimitSecret: null,
      onRateLimitQuery() {
        rateLimitQueried = true;
      },
    }),
    waitUntil() {},
  });

  assert.equal(response.status, 503);
  assert.equal(rateLimitQueried, false);
});

test("root-relativeでないURLとlocale不一致のmetadataを除外する", async () => {
  const env = createEnv({
    matches: [
      {
        id: "absolute",
        score: 0.9,
        metadata: {
          url: "https://evil.example/learning/",
          title: "外部URL",
          section: "外部URL",
          excerpt: "外部URL",
          contentType: "page",
          locale: "ja",
        },
      },
      {
        id: "protocol-relative",
        score: 0.89,
        metadata: {
          url: "//evil.example/learning/",
          title: "外部URL",
          section: "外部URL",
          excerpt: "外部URL",
          contentType: "page",
          locale: "ja",
        },
      },
      {
        id: "wrong-locale",
        score: 0.88,
        metadata: {
          url: "/learning/",
          title: "Learning",
          section: "Learning",
          excerpt: "Learning",
          contentType: "page",
          locale: "en",
        },
      },
      {
        id: "valid",
        score: 0.87,
        metadata: {
          url: "/faq/#faq",
          title: "よくあるご質問",
          section: "料金はいつ分かりますか？",
          excerpt: "料金の目安を掲載しています。",
          contentType: "faq",
          locale: "ja",
        },
      },
    ],
  });

  const response = await onRequestPost({
    request: searchRequest({ query: "料金について", locale: "ja" }),
    env,
    waitUntil() {},
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(
    body.results.map((result) => result.url),
    ["/faq/#faq"],
  );
});

test("binding未設定または無効化中は503でfail closedする", async () => {
  const missingBindingResponse = await onRequestPost({
    request: searchRequest({ query: "料金について", locale: "ja" }),
    env: {},
    waitUntil() {},
  });
  const disabledResponse = await onRequestPost({
    request: searchRequest({ query: "料金について", locale: "ja" }),
    env: createEnv({ searchEnabled: false }),
    waitUntil() {},
  });

  assert.equal(missingBindingResponse.status, 503);
  assert.equal(disabledResponse.status, 503);
});

test("D1障害はWorkers AIを呼ばず503でfail closedする", async () => {
  let aiCalled = false;
  const env = createEnv({
    rateLimitError: new Error("D1 unavailable"),
    onAiRun() {
      aiCalled = true;
    },
  });
  const response = await withCapturedErrors(() =>
    onRequestPost({
      request: searchRequest({ query: "料金について", locale: "ja" }),
      env,
      waitUntil() {},
    }),
  );

  assert.equal(response.status, 503);
  assert.equal(aiCalled, false);
});

test("Workers AIとVectorizeの障害は502でfail closedする", async () => {
  const aiResponse = await withCapturedErrors(() =>
    onRequestPost({
      request: searchRequest({ query: "料金について", locale: "ja" }),
      env: createEnv({ aiError: new Error("AI unavailable") }),
      waitUntil() {},
    }),
  );
  const vectorizeResponse = await withCapturedErrors(() =>
    onRequestPost({
      request: searchRequest({ query: "料金について", locale: "ja" }),
      env: createEnv({ vectorizeError: new Error("Vectorize unavailable") }),
      waitUntil() {},
    }),
  );

  assert.equal(aiResponse.status, 502);
  assert.equal(vectorizeResponse.status, 502);
});

test("不正なembeddingを502にし、logへquery本文を残さない", async () => {
  const originalError = console.error;
  const logs = [];
  console.error = (value) => logs.push(String(value));

  try {
    const env = createEnv({ embedding: [0.1] });
    const response = await onRequestPost({
      request: searchRequest({
        query: "秘密を含む検索テキスト",
        locale: "ja",
      }),
      env,
      waitUntil() {},
    });

    assert.equal(response.status, 502);
    assert.equal(logs.length, 1);
    assert.doesNotMatch(logs[0], /秘密を含む検索テキスト/);
    assert.match(logs[0], /invalid_embedding/);
  } finally {
    console.error = originalError;
  }
});

function searchRequest(body, headerOverrides = {}) {
  return new Request("https://schools.acecore.net/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Origin: "https://schools.acecore.net",
      "X-Acecore-Search-Client": "018f7e5a-7b4d-7c6a-8e9f-0123456789ab",
      ...headerOverrides,
    },
    body: JSON.stringify(body),
  });
}

function createEnv({
  matches = [],
  embedding = queryVector,
  searchEnabled = true,
  clientRateLimitSuccess = true,
  globalRateLimitSuccess = true,
  rateLimitError,
  metricError,
  aiError,
  vectorizeError,
  rateLimitSecret = "test-search-rate-limit-secret-32-bytes",
  onAiRun = () => {},
  onQuery = () => {},
  onRateLimit = () => {},
  onRateLimitQuery = () => {},
  onRateLimitCleanup = () => {},
  onMetric = () => {},
  onMetricCleanup = () => {},
} = {}) {
  return {
    SEARCH_ENABLED: searchEnabled ? "true" : "false",
    SEARCH_MIN_SCORE: "0.50",
    SEARCH_RATE_LIMIT_SECRET: rateLimitSecret,
    SEARCH_RATE_LIMIT_DB: createRateLimitDatabase({
      clientRateLimitSuccess,
      globalRateLimitSuccess,
      rateLimitError,
      metricError,
      onRateLimit,
      onRateLimitQuery,
      onRateLimitCleanup,
      onMetric,
      onMetricCleanup,
    }),
    AI: {
      async run(model, input) {
        onAiRun(model, input);
        if (aiError) throw aiError;
        assert.equal(model, "@cf/baai/bge-m3");
        assert.deepEqual(input, {
          text: [input.text[0]],
          truncate_inputs: true,
        });
        return { data: [embedding] };
      },
    },
    SEARCH_INDEX: {
      async query(values, options) {
        if (vectorizeError) throw vectorizeError;
        assert.equal(values.length, 1024);
        onQuery(values, options);
        return { count: matches.length, matches };
      },
    },
  };
}

function createRateLimitDatabase({
  clientRateLimitSuccess,
  globalRateLimitSuccess,
  rateLimitError,
  metricError,
  onRateLimit,
  onRateLimitQuery,
  onRateLimitCleanup,
  onMetric,
  onMetricCleanup,
}) {
  return {
    prepare(query) {
      if (query.startsWith("DELETE FROM semantic_search_rate_limits")) {
        return {
          bind(...values) {
            return {
              async run() {
                onRateLimitCleanup(values);
                return { success: true };
              },
            };
          },
        };
      }

      if (query.startsWith("DELETE FROM semantic_search_metrics")) {
        return {
          bind(...values) {
            return {
              async run() {
                onMetricCleanup(values);
                return { success: true };
              },
            };
          },
        };
      }

      if (query.includes("INSERT INTO semantic_search_metrics")) {
        return {
          bind(...values) {
            return {
              async run() {
                if (metricError) throw metricError;
                onMetric(values);
                return { success: true };
              },
            };
          },
        };
      }

      assert.match(query, /INSERT INTO semantic_search_rate_limits/);
      return {
        bind(clientKey, ...values) {
          return {
            async all() {
              if (rateLimitError) throw rateLimitError;
              onRateLimitQuery({ clientKey, query, values });
              const success = clientRateLimitSuccess && globalRateLimitSuccess;
              const results = success
                ? [
                    { limiter_key: clientKey, request_count: 1 },
                    { limiter_key: "global", request_count: 1 },
                  ]
                : [];
              for (const { limiter_key } of results) {
                onRateLimit(limiter_key);
              }
              return { success: true, results };
            },
          };
        },
      };
    },
  };
}

async function withCapturedErrors(run) {
  const originalError = console.error;
  console.error = () => {};
  try {
    return await run();
  } finally {
    console.error = originalError;
  }
}

async function withCapturedLogs(run) {
  const originalLog = console.log;
  const logs = [];
  console.log = (value) => logs.push(String(value));
  try {
    return { result: await run(), logs };
  } finally {
    console.log = originalLog;
  }
}
