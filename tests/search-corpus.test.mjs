import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";

import {
  SEARCH_EMBEDDING_DIMENSIONS,
  SEARCH_MAX_CHUNK_LENGTH,
  SEARCH_REQUIRED_SOURCE_PATHS,
  buildSearchCorpus,
  chunkSearchDocument,
  extractSearchDocument,
} from "../scripts/build-search-corpus.mjs";

function pageHtml({
  path,
  title,
  body,
  robots = "",
  canonicalOrigin = "https://schools.acecore.net",
}) {
  return `<!doctype html>
    <html lang="ja">
      <head>
        <title>${title} | Acecore Schools</title>
        <meta name="description" content="${title}の説明">
        ${robots ? `<meta name="robots" content="${robots}">` : ""}
        <link rel="canonical" href="${canonicalOrigin}${path}">
      </head>
      <body>
        <nav><p>グローバルナビゲーションは検索対象外です。</p></nav>
        <main>
          <h1>${title}</h1>
          ${body}
          <aside><p>補助ナビゲーションも検索対象外です。</p></aside>
          <p aria-hidden="true">視覚的な装飾文です。</p>
          <div data-search-ignore><p>検索除外を明示した文です。</p></div>
          <section class="consultation">
            <h2>無料相談</h2>
            <p>全ページで共通する相談導線です。</p>
          </section>
        </main>
        <footer><p>フッターは検索対象外です。</p></footer>
      </body>
    </html>`;
}

async function writeDistPage(distDir, path, html) {
  const file =
    path === "/"
      ? join(distDir, "index.html")
      : join(distDir, path.slice(1), "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html, "utf8");
}

async function createCompleteDist() {
  const distDir = await mkdtemp(join(tmpdir(), "schools-search-corpus-"));
  for (const [index, path] of SEARCH_REQUIRED_SOURCE_PATHS.entries()) {
    const title = path === "/" ? "目的から学ぶ" : `Schoolsページ${index + 1}`;
    await writeDistPage(
      distDir,
      path,
      pageHtml({
        path,
        title,
        body: `
          <p>${title}では、一人ひとりの目的と現在地を確認し、必要な学びを具体的に組み立てます。</p>
          <h2>学び方</h2>
          <p>相談と実践を往復しながら、内容やペースを見直して前へ進みます。</p>
        `,
      }),
    );
  }
  await writeFile(
    join(distDir, "404.html"),
    pageHtml({
      path: "/404/",
      title: "ページが見つかりません",
      body: "<p>このページは検索結果へ含めません。</p>",
    }),
    "utf8",
  );
  return distDir;
}

test("公開後HTMLから本文だけを抽出する", () => {
  const distDir = resolve("dist");
  const htmlFile = resolve(distDir, "learning", "index.html");
  const document = extractSearchDocument(
    pageHtml({
      path: "/learning/",
      title: "学べること",
      body: `
        <p>高卒認定、IT、PC活用、ロボット制作を目的に合わせて学びます。</p>
        <h2>IT・プログラミング</h2>
        <p>Webサイトや小さなツールを実際に形にしながら学びます。</p>
      `,
    }),
    htmlFile,
    distDir,
  );

  assert.ok(document);
  assert.equal(document.url, "/learning/");
  assert.equal(document.locale, "ja");
  assert.equal(document.title, "学べること");
  assert.equal(document.contentType, "page");
  const text = document.blocks.map(({ text }) => text).join(" ");
  assert.match(text, /高卒認定/u);
  assert.match(text, /小さなツール/u);
  assert.doesNotMatch(text, /グローバルナビゲーション/u);
  assert.doesNotMatch(text, /補助ナビゲーション/u);
  assert.doesNotMatch(text, /視覚的な装飾文/u);
  assert.doesNotMatch(text, /検索除外を明示/u);
  assert.doesNotMatch(text, /全ページで共通する相談導線/u);
  assert.doesNotMatch(text, /フッター/u);
});

test("6つの公開routeからja namespaceのcorpusを生成する", async (t) => {
  const distDir = await createCompleteDist();
  t.after(() => rm(distDir, { recursive: true, force: true }));

  const corpus = await buildSearchCorpus({ distDir, write: false });

  assert.equal(corpus.schemaVersion, 1);
  assert.equal(corpus.embedding.model, "@cf/baai/bge-m3");
  assert.equal(corpus.embedding.dimensions, SEARCH_EMBEDDING_DIMENSIONS);
  assert.equal(corpus.embedding.metric, "cosine");
  assert.equal(corpus.sourceCount, 6);
  assert.deepEqual(
    new Set(corpus.sourceUrls),
    new Set(SEARCH_REQUIRED_SOURCE_PATHS),
  );
  assert.ok(corpus.vectorCount >= 6);
  assert.equal(corpus.localeCounts.ja, corpus.vectorCount);
  assert.equal(corpus.chunks.length, corpus.vectorCount);
  assert.equal(
    new Set(corpus.chunks.map(({ id }) => id)).size,
    corpus.vectorCount,
  );

  for (const chunk of corpus.chunks) {
    assert.match(chunk.id, /^schools-v2-[0-9a-f]{48}$/u);
    assert.equal(chunk.namespace, "ja");
    assert.equal(chunk.metadata.locale, "ja");
    assert.match(chunk.metadata.contentDigest, /^[0-9a-f]{20}$/u);
    assert.ok(SEARCH_REQUIRED_SOURCE_PATHS.includes(chunk.metadata.url));
    assert.ok(chunk.text.length <= SEARCH_MAX_CHUNK_LENGTH);
  }
});

test("本文変更では安定IDを維持しcorpus versionだけを更新する", async (t) => {
  const distDir = await createCompleteDist();
  t.after(() => rm(distDir, { recursive: true, force: true }));

  const first = await buildSearchCorpus({ distDir, write: false });
  await writeDistPage(
    distDir,
    "/faq/",
    pageHtml({
      path: "/faq/",
      title: "よくある質問",
      body: `
        <p>相談前に確認できる質問と回答を、最新の案内に合わせて掲載します。</p>
        <h2>相談方法</h2>
        <p>目的と現在地を確認し、必要な学び方を一緒に整理します。</p>
      `,
    }),
  );
  const second = await buildSearchCorpus({ distDir, write: false });

  const firstIds = first.chunks
    .filter(({ metadata }) => metadata.url === "/faq/")
    .map(({ id }) => id);
  const secondIds = second.chunks
    .filter(({ metadata }) => metadata.url === "/faq/")
    .map(({ id }) => id);

  assert.deepEqual(secondIds, firstIds);
  assert.notEqual(second.version, first.version);
  assert.notDeepEqual(
    second.chunks
      .filter(({ metadata }) => metadata.url === "/faq/")
      .map(({ metadata }) => metadata.contentDigest),
    first.chunks
      .filter(({ metadata }) => metadata.url === "/faq/")
      .map(({ metadata }) => metadata.contentDigest),
  );
});

test("必須routeが欠けたcorpus生成を停止する", async (t) => {
  const distDir = await createCompleteDist();
  t.after(() => rm(distDir, { recursive: true, force: true }));
  await rm(join(distDir, "faq"), { recursive: true, force: true });

  await assert.rejects(
    buildSearchCorpus({ distDir, write: false }),
    /Missing: \/faq\//u,
  );
});

test("noindexページを除外し、外部canonicalを採用しない", () => {
  const distDir = resolve("dist");
  const htmlFile = resolve(distDir, "faq", "index.html");
  const noIndex = extractSearchDocument(
    pageHtml({
      path: "/faq/",
      title: "よくある質問",
      robots: "noindex, nofollow",
      body: "<p>十分な長さを持つ、検索対象外の説明文章です。</p>",
    }),
    htmlFile,
    distDir,
  );
  assert.equal(noIndex, null);

  const externalCanonical = extractSearchDocument(
    pageHtml({
      path: "/wrong/",
      title: "よくある質問",
      canonicalOrigin: "https://example.com",
      body: `
        <p>質問と回答を確認できる、十分な長さを持った公開ページの説明文章です。</p>
        <p>無料相談の前に、よくある質問から基本的な情報を確認できます。</p>
      `,
    }),
    htmlFile,
    distDir,
  );
  assert.equal(externalCanonical?.url, "/faq/");
});

test("長文を上限以下の安定したID付きchunkへ分割する", () => {
  const document = {
    url: "/learning/",
    locale: "ja",
    title: "学べること",
    description: "",
    contentType: "page",
    blocks: [
      {
        heading: "IT・プログラミング",
        text: "目的に合わせて手を動かしながら学びます。".repeat(180),
      },
    ],
  };

  const first = chunkSearchDocument(document);
  const second = chunkSearchDocument(document);
  assert.ok(first.length > 1);
  assert.deepEqual(first, second);
  assert.ok(first.every(({ text }) => text.length <= SEARCH_MAX_CHUNK_LENGTH));
});
