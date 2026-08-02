import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  AI_CHAT_MAX_HISTORY,
  AI_CHAT_MAX_HISTORY_LENGTH,
  AI_CHAT_MAX_QUESTION_LENGTH,
  AI_CHAT_TIMEOUT_MS,
  createStableClientId,
  normalizeSafeMarkdownHref,
  trimChatHistory,
} from "../src/components/schools-ai-chat.ts";

test("AI案内の通信上限を中央API契約に合わせる", () => {
  assert.equal(AI_CHAT_TIMEOUT_MS, 25_000);
  assert.equal(AI_CHAT_MAX_HISTORY, 8);
  assert.equal(AI_CHAT_MAX_HISTORY_LENGTH, 2_400);
  assert.equal(AI_CHAT_MAX_QUESTION_LENGTH, 800);

  const history = Array.from({ length: 10 }, (_, index) => ({
    role: index % 2 === 0 ? "user" : "assistant",
    content: `${index}`.repeat(900),
  }));
  const trimmed = trimChatHistory(history);
  assert.equal(trimmed.length, 3);
  assert.equal(trimmed[0].content[0], "7");
  assert.equal(trimmed.at(-1).content[0], "9");
  assert.equal(
    trimmed.reduce((total, { content }) => total + content.length, 0),
    AI_CHAT_MAX_HISTORY_LENGTH,
  );
  assert.ok(
    trimmed.every(
      ({ content }) => content.length <= AI_CHAT_MAX_QUESTION_LENGTH,
    ),
  );
});

test("client UUIDは同じ画面内で安定し不正なIDを拒否する", () => {
  let calls = 0;
  const getClientId = createStableClientId(() => {
    calls += 1;
    return "123e4567-e89b-42d3-a456-426614174000";
  });

  assert.equal(getClientId(), "123e4567-e89b-42d3-a456-426614174000");
  assert.equal(getClientId(), "123e4567-e89b-42d3-a456-426614174000");
  assert.equal(calls, 1);
  assert.throws(() => createStableClientId(() => "not-a-uuid")(), /UUID v4/u);
});

test("MarkdownリンクはAcecoreの許可済み導線だけをURL化する", () => {
  assert.equal(
    normalizeSafeMarkdownHref("/contact/?category=service"),
    "https://acecore.net/contact/?category=service",
  );
  assert.equal(
    normalizeSafeMarkdownHref("https://schools.acecore.net/pricing/"),
    "https://schools.acecore.net/pricing/",
  );
  assert.equal(
    normalizeSafeMarkdownHref("https://asv-wiki.acecore.net/guide/"),
    "https://asv-wiki.acecore.net/guide/",
  );
  assert.equal(
    normalizeSafeMarkdownHref("https://world-foundation.acecore.net/"),
    "https://world-foundation.acecore.net/",
  );
  assert.equal(
    normalizeSafeMarkdownHref("https://lin.ee/DjIrdqj"),
    "https://lin.ee/DjIrdqj",
  );
  assert.equal(
    normalizeSafeMarkdownHref("mailto:info@acecore.net?subject=Schools"),
    "mailto:info@acecore.net?subject=Schools",
  );
  assert.equal(
    normalizeSafeMarkdownHref("https://acecore.net.evil.example/contact/"),
    null,
  );
  assert.equal(normalizeSafeMarkdownHref("/\\evil.example/"), null);
  assert.equal(normalizeSafeMarkdownHref("/\u0000contact/"), null);
  assert.equal(normalizeSafeMarkdownHref("https://user@acecore.net/"), null);
  assert.equal(normalizeSafeMarkdownHref("javascript:alert(1)"), null);
  assert.equal(normalizeSafeMarkdownHref("//evil.example/contact/"), null);
  assert.equal(normalizeSafeMarkdownHref("https://example.com/"), null);
});

test("全ページの共通layoutへ安全な中央AI案内を組み込む", async () => {
  const [component, script, layout, data] = await Promise.all([
    readFile(
      new URL("../src/components/SchoolsAiChat.astro", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/schools-ai-chat.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../src/components/SchoolsPage.astro", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../src/data/schools.ts", import.meta.url), "utf8"),
  ]);

  assert.match(component, /data-endpoint="\/api\/ai-chat"/u);
  assert.match(component, /role="dialog"/u);
  assert.match(component, /aria-modal="false"/u);
  assert.match(component, /aria-live="polite"/u);
  assert.match(component, /maxlength="800"/u);
  assert.match(script, /"X-Acecore-AI-Client": getStableClientId\(\)/u);
  assert.match(script, /new AbortController\(\)/u);
  assert.match(script, /event\.key === "Escape"/u);
  assert.match(script, /credentials: "omit"/u);
  assert.doesNotMatch(script, /event\.key !== "Tab"/u);
  assert.doesNotMatch(script, /localStorage|sessionStorage|innerHTML/u);
  assert.match(layout, /<SchoolsAiChat \/>/u);
  assert.match(data, /LINEで無料相談/u);
  assert.match(data, /個人情報・秘密情報は入力しないでください/u);
});
