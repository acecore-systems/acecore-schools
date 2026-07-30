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

test("終了済み記録はeventStatusを省略できる", () => {
  const result = auditStructuredDataHtml(
    htmlWithStructuredData({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Event",
          startDate: "2023-08-20T14:00:00+09:00",
          endDate: "2023-08-20T15:30:00+09:00",
        },
        {
          "@type": "Event",
          startDate: "2023-08-27T14:00:00+09:00",
          endDate: "2023-08-27T15:30:00+09:00",
        },
      ],
    }),
    { source: "past-events.html" },
  );

  assert.equal(result.eventNodes, 2);
  assert.equal(result.eventStatuses, 0);
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

test("活動記録ページに移管した2件のEventを必須にする", () => {
  assert.deepEqual(validateWorkshopStructuredData({ eventNodes: 2 }), []);
  assert.match(
    validateWorkshopStructuredData({ eventNodes: 1 })[0],
    /expected 2 Event nodes/u,
  );
  assert.match(
    validateWorkshopStructuredData()[0],
    new RegExp(WORKSHOP_ACTIVITY_OUTPUT.replaceAll("/", "\\/"), "u"),
  );
});
