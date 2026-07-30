import assert from "node:assert/strict";
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

test("client rate limit拒否後はglobal枠を消費せず429を返す", async () => {
  const consumedKeys = [];
  const env = createEnv({
    clientRateLimitSuccess: false,
    onRateLimit(key) {
      consumedKeys.push(key);
    },
  });
  const response = await onRequestPost({
    request: searchRequest({ query: "料金について", locale: "ja" }),
    env,
    waitUntil() {},
  });

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.equal(consumedKeys.length, 1);
  assert.match(consumedKeys[0], /^client:[0-9a-f]{64}$/);
});

test("global rate limit拒否はclientとglobalを消費して429を返す", async () => {
  const consumedKeys = [];
  const env = createEnv({
    globalRateLimitSuccess: false,
    onRateLimit(key) {
      consumedKeys.push(key);
    },
  });
  const response = await onRequestPost({
    request: searchRequest({ query: "料金について", locale: "ja" }),
    env,
    waitUntil() {},
  });

  assert.equal(response.status, 429);
  assert.equal(consumedKeys.length, 2);
  assert.equal(consumedKeys[1], "global");
});

test("Cloudflare接続IPをhashしたclient keyを自己申告UUIDより優先する", async () => {
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
  aiError,
  vectorizeError,
  onAiRun = () => {},
  onQuery = () => {},
  onRateLimit = () => {},
} = {}) {
  return {
    SEARCH_ENABLED: searchEnabled ? "true" : "false",
    SEARCH_MIN_SCORE: "0.50",
    SEARCH_RATE_LIMIT_DB: createRateLimitDatabase({
      clientRateLimitSuccess,
      globalRateLimitSuccess,
      rateLimitError,
      onRateLimit,
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
  onRateLimit,
}) {
  return {
    prepare(query) {
      if (query.startsWith("DELETE")) {
        return {
          bind() {
            return {
              async run() {
                return { success: true };
              },
            };
          },
        };
      }

      assert.match(query, /INSERT INTO semantic_search_rate_limits/);
      return {
        bind(key) {
          return {
            async first() {
              if (rateLimitError) throw rateLimitError;
              onRateLimit(key);
              const success =
                key === "global"
                  ? globalRateLimitSuccess
                  : clientRateLimitSuccess;
              return success ? { request_count: 1 } : null;
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
