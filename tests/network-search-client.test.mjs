import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  NETWORK_SEARCH_ENDPOINT,
  fetchNetworkSearch,
  parseNetworkSearchResults,
} from "../src/scripts/network-search.ts";
import { isStrictUuid } from "../src/scripts/search-response-safety.ts";
import { getSafeInternalUrl } from "../src/scripts/search-url-safety.ts";

const VALID_REQUEST_ID = "018f0c49-10a4-4d8e-a1c0-112233445566";

test("横断検索はsiteを送らず、現在サイト以外の許可済みHTTPS結果だけを返す", async () => {
  let request;
  const controller = new AbortController();
  const results = await fetchNetworkSearch(
    " 学習 相談 ",
    "schools",
    controller.signal,
    async (input, init) => {
      request = { input, init };
      return Response.json({
        ok: true,
        requestId: VALID_REQUEST_ID,
        results: [
          resultFor("systems", {
            url: "https://systems.acecore.net/case-studies/example/",
            sourceLabel: "Acecore Systems",
            rank: 1,
          }),
          resultFor("schools", {
            url: "https://schools.acecore.net/faq/",
            rank: 2,
          }),
        ],
      });
    },
  );

  assert.equal(request.input, NETWORK_SEARCH_ENDPOINT);
  assert.equal(request.init.method, "POST");
  assert.equal(request.init.credentials, "omit");
  assert.deepEqual(JSON.parse(request.init.body), {
    query: " 学習 相談 ",
    locale: "ja",
  });
  assert.equal("site" in JSON.parse(request.init.body), false);
  assert.deepEqual(results, [
    {
      title: "公開ページ",
      section: "概要",
      excerpt: "公開済みの内容です。",
      url: "https://systems.acecore.net/case-studies/example/",
      source: "systems",
      sourceLabel: "Acecore Systems",
      rank: 1,
    },
  ]);
});

test("横断検索は不正なorigin、管理path、decoded path、query/hash、rankと重複URLを表示しない", () => {
  const results = parseNetworkSearchResults(
    {
      ok: true,
      requestId: VALID_REQUEST_ID,
      results: [
        resultFor("systems", {
          url: "https://systems.acecore.net/case-studies/valid/",
          rank: 1,
        }),
        resultFor("systems", {
          url: "https://systems.acecore.net/case-studies/valid/",
          rank: 2,
        }),
        resultFor("systems", { url: "http://systems.acecore.net/unsafe/" }),
        resultFor("systems", { url: "https://example.com/unsafe/" }),
        resultFor("systems", { url: "https://systems.acecore.net/admin/" }),
        resultFor("systems", { url: "https://systems.acecore.net/api/search" }),
        resultFor("acecore", { url: "https://acecore.net/%61dmin/" }),
        resultFor("portal", { url: "https://asv.acecore.net/%61pi/search" }),
        resultFor("acecore", { url: "https://acecore.net/%2561dmin/" }),
        resultFor("portal", {
          url: "https://asv.acecore.net/%2561pi/search",
        }),
        resultFor("acecore", {
          url: "https://acecore.net/%252561dmin/",
        }),
        resultFor("acecore", { url: "https://acecore.net/%ZZ/" }),
        resultFor("acecore", {
          url: "https://acecore.net/%252e%252e/admin/",
        }),
        resultFor("acecore", { url: "https://acecore.net/%252e/" }),
        resultFor("acecore", {
          url: "https://acecore.net/related//duplicate/",
        }),
        resultFor("acecore", { url: "https://acecore.net/%2fprivate/" }),
        resultFor("acecore", { url: "https://acecore.net/%5cprivate/" }),
        resultFor("acecore", { url: "https://acecore.net/%252fprivate/" }),
        resultFor("acecore", {
          url: "https://acecore.net/safe%252fprivate/",
        }),
        resultFor("acecore", { url: "https://acecore.net/%255cprivate/" }),
        resultFor("acecore", { url: "https://acecore.net/%2500private/" }),
        resultFor("acecore", { url: "https://acecore.net/%3Fsearch/" }),
        resultFor("acecore", { url: "https://acecore.net/%23search/" }),
        resultFor("acecore", { url: "https://acecore.net/%253Fsearch/" }),
        resultFor("acecore", { url: "https://acecore.net/%2523search/" }),
        resultFor("acecore", {
          url: "https://acecore.net/%EF%BC%85%36%31dmin/",
        }),
        resultFor("acecore", {
          url: "https://acecore.net/%EF%BC%85%36%31pi/search",
        }),
        resultFor("acecore", {
          url: "https://acecore.net/safe/../admin/",
        }),
        resultFor("acecore", {
          url: "https://acecore.net/safe/../services/",
        }),
        resultFor("acecore", {
          url: "https://acecore.net/safe\\private/",
        }),
        resultFor("acecore", {
          url: "https://acecore.net/safe/\tprivate/",
        }),
        resultFor("acecore", {
          url: "https://acecore.net/safe/\u0001private/",
        }),
        resultFor("systems", {
          url: "https://systems.acecore.net/case-studies/?ref=unsafe",
        }),
        resultFor("systems", {
          url: "https://systems.acecore.net/case-studies/#unsafe",
        }),
        resultFor("systems", {
          url: "https://systems.acecore.net/case-studies/spoofed-label/",
          sourceLabel: "Acecore",
        }),
        resultFor("wiki", {
          url: "https://asv-wiki.acecore.net/not-an-article/",
        }),
        resultFor("world-foundation", {
          url: "https://world-foundation.acecore.net/api/private/",
        }),
        resultFor("acecore", { rank: 0 }),
        resultFor("unknown", {
          url: "https://systems.acecore.net/case-studies/unknown/",
        }),
        resultFor("toString", {
          url: "https://systems.acecore.net/case-studies/prototype/",
        }),
      ],
    },
    "schools",
  );

  assert.deepEqual(
    results.map(({ url, rank }) => ({ url, rank })),
    [
      {
        url: "https://systems.acecore.net/case-studies/valid/",
        rank: 1,
      },
    ],
  );
});

test("ローカル検索URLは正規化後の公開pathだけを許可する", () => {
  const origin = "https://schools.acecore.net";
  assert.equal(getSafeInternalUrl("/learning/", origin), "/learning/");

  for (const url of [
    "/admin/",
    "/api/search",
    "/%61dmin/",
    "/%61pi/search",
    "/%252e%252e/admin/",
    "/safe/../admin/",
    "/safe/../services/",
    "/safe/%2e%2e/admin/",
    "/safe/%2fprivate/",
    "/safe/%5cprivate/",
    "/safe%252fprivate/",
    "/safe\\private/",
    "\t/learning/",
    "/learning/\t",
    "/safe/\u0001private/",
    "/%EF%BC%85%36%31dmin/",
    "/%EF%BC%85%36%31pi/search",
    "/%252fprivate/",
    "/safe/?query=1",
    "/safe/#hash",
    "/%3Fquery",
    "/%23hash",
    "//example.com/",
    "https://schools.acecore.net/learning/",
  ]) {
    assert.equal(getSafeInternalUrl(url, origin), null, url);
  }
});

test("横断検索はUUID形式のrequestIdを必須にし、最大3件だけ許容する", () => {
  const payload = {
    ok: true,
    requestId: VALID_REQUEST_ID,
    results: [
      resultFor("systems", {
        url: "https://systems.acecore.net/case-studies/one/",
        rank: 1,
      }),
      resultFor("wiki", {
        url: "https://asv-wiki.acecore.net/article/two/",
        rank: 2,
      }),
      resultFor("portal", {
        url: "https://asv.acecore.net/three/",
        rank: 3,
      }),
      resultFor("acecore", {
        url: "https://acecore.net/four/",
        rank: 4,
      }),
    ],
  };

  assert.equal(parseNetworkSearchResults(payload, "schools").length, 3);
  for (const requestId of [
    undefined,
    "not-a-uuid",
    "00000000-0000-0000-0000-000000000000",
    ` ${VALID_REQUEST_ID}`,
    `${VALID_REQUEST_ID}\t`,
    VALID_REQUEST_ID.replace(/-/gu, "－"),
  ]) {
    assert.deepEqual(
      parseNetworkSearchResults({ ...payload, requestId }, "schools"),
      [],
    );
  }
});

test("requestIdは正規化・trimせず生のUUIDだけを許可する", () => {
  assert.equal(isStrictUuid(VALID_REQUEST_ID), true);

  for (const requestId of [
    `\t${VALID_REQUEST_ID}`,
    `${VALID_REQUEST_ID} `,
    VALID_REQUEST_ID.replace(/-/gu, "－"),
  ]) {
    assert.equal(isStrictUuid(requestId), false, requestId);
  }
});

test("サイト内検索はVectorizeが使えない時だけPagefindを表示し、横断結果を下部へ分離する", async () => {
  const [panel, layout, packageJson, headers] = await Promise.all([
    readFile(
      new URL("../src/components/SearchPanel.astro", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/SchoolsPage.astro", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../public/_headers", import.meta.url), "utf8"),
  ]);

  assert.match(panel, /data-pagefind-ignore/u);
  assert.match(panel, /fetchNetworkSearch\(query, "schools"/u);
  assert.match(panel, /new PagefindUI/u);
  assert.match(panel, /pagefind-ui\.js/u);
  assert.match(panel, /data-network-search/u);
  assert.match(panel, /target = "_blank"/u);
  assert.match(panel, /slice\(0, 3\)/u);
  assert.match(panel, /getSafeInternalUrl\(value, window\.location\.origin\)/u);
  assert.match(panel, /isStrictUuid\(payload\.requestId\)/u);
  assert.doesNotMatch(
    panel,
    /setLoading\(true\);\s*runNetworkSearch\(query, sequence\);/u,
  );
  assert.match(panel, /await showPagefindFallback\(\);/u);
  assert.match(layout, /data-pagefind-body/u);
  assert.match(layout, /const revealSearch =/u);
  assert.doesNotMatch(layout, /fetch\("\/api\/health"/u);
  assert.match(packageJson, /"pagefind": "\^1\.5\.2"/u);
  assert.match(headers, /\/pagefind\/index\/\*/u);
});

const sourceLabels = {
  acecore: "Acecore",
  systems: "Acecore Systems",
  schools: "Acecore Schools",
  wiki: "Aceserver WIKI",
  portal: "Aceserver Portal",
  "world-foundation": "World Foundation",
};

function resultFor(source, overrides = {}) {
  return {
    title: "公開ページ",
    section: "概要",
    excerpt: "公開済みの内容です。",
    url: "https://acecore.net/about/",
    source,
    sourceLabel: sourceLabels[source] ?? "公式サイト",
    rank: 1,
    ...overrides,
  };
}
