import assert from "node:assert/strict";
import test from "node:test";

import {
  auditStructuredDataHtml,
  OFFICIAL_EVENT_STATUS_TYPES,
  validateWorkshopStructuredData,
  WORKSHOP_ACTIVITY_OUTPUT,
} from "../scripts/audit-built-structured-data.mjs";

function htmlWithStructuredData(structuredData) {
  return `<!doctype html>
    <html lang="ja">
      <head>
        <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
      </head>
      <body></body>
    </html>`;
}

test("EventStatusTypeの公式列挙だけを許可する", () => {
  assert.deepEqual([...OFFICIAL_EVENT_STATUS_TYPES].sort(), [
    "https://schema.org/EventCancelled",
    "https://schema.org/EventMovedOnline",
    "https://schema.org/EventPostponed",
    "https://schema.org/EventRescheduled",
    "https://schema.org/EventScheduled",
  ]);

  const result = auditStructuredDataHtml(
    htmlWithStructuredData({
      "@context": "https://schema.org",
      "@graph": [...OFFICIAL_EVENT_STATUS_TYPES].map((eventStatus, index) => ({
        "@type": "Event",
        "@id": `https://schools.acecore.net/events/#event-${index + 1}`,
        eventStatus,
      })),
    }),
    { source: "official-statuses.html" },
  );

  assert.equal(result.eventNodes, OFFICIAL_EVENT_STATUS_TYPES.size);
  assert.equal(result.eventStatuses, OFFICIAL_EVENT_STATUS_TYPES.size);
  assert.deepEqual(result.failures, []);
});

test("EventCompletedの再混入を拒否する", () => {
  const result = auditStructuredDataHtml(
    htmlWithStructuredData({
      "@context": "https://schema.org",
      "@type": "Event",
      eventStatus: "https://schema.org/EventCompleted",
    }),
    { source: "completed-event.html" },
  );

  assert.equal(result.eventNodes, 1);
  assert.equal(result.eventStatuses, 1);
  assert.match(result.failures[0], /EventCompleted/u);
});

test("終了済みの活動記録はArticleとして残し、Eventを出力しない", () => {
  const result = auditStructuredDataHtml(
    htmlWithStructuredData({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "2023年夏のロボット工作体験",
    }),
    { source: "past-events.html" },
  );

  assert.equal(result.eventNodes, 0);
  assert.equal(result.eventStatuses, 0);
  assert.equal(result.articleNodes, 1);
  assert.deepEqual(result.failures, []);
});

test("不正なJSON-LDを拒否する", () => {
  const result = auditStructuredDataHtml(
    '<script type="application/ld+json">{"@type":"Event"</script>',
    { source: "invalid-json-ld.html" },
  );

  assert.equal(result.structuredDataScripts, 1);
  assert.match(result.failures[0], /JSON-LD script/u);
});

test("終了済み活動記録にはArticleのみを必須にする", () => {
  assert.deepEqual(
    validateWorkshopStructuredData({ eventNodes: 0, articleNodes: 1 }),
    [],
  );
  assert.match(
    validateWorkshopStructuredData({ eventNodes: 1, articleNodes: 1 })[0],
    /expected 0 Event nodes/u,
  );
  assert.match(
    validateWorkshopStructuredData({ eventNodes: 0, articleNodes: 0 })[0],
    /expected 1 Article node/u,
  );
  assert.match(
    validateWorkshopStructuredData()[0],
    new RegExp(WORKSHOP_ACTIVITY_OUTPUT.replaceAll("/", "\\/"), "u"),
  );
});
