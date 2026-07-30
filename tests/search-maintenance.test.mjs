import assert from "node:assert/strict";
import { test } from "node:test";

import maintenanceWorker, {
  deleteExpiredSearchData,
} from "../workers/semantic-search-maintenance.ts";

test("期限切れrate keyと90日超metricを同じbatchで削除する", async () => {
  const calls = [];
  const database = createDatabase(calls);
  const now = 2_000_000_000;

  await deleteExpiredSearchData(database, now);

  assert.deepEqual(calls, [
    {
      query: "DELETE FROM semantic_search_rate_limits WHERE expires_at < ?1",
      values: [now],
    },
    {
      query: "DELETE FROM semantic_search_metrics WHERE expires_at < ?1",
      values: [now],
    },
  ]);
});

test("scheduled eventはPreviewとProductionを同じ時刻でcleanupする", async () => {
  const previewCalls = [];
  const productionCalls = [];

  await maintenanceWorker.scheduled(
    {},
    {
      SEARCH_PREVIEW_DB: createDatabase(previewCalls),
      SEARCH_PRODUCTION_DB: createDatabase(productionCalls),
    },
  );

  assert.equal(previewCalls.length, 2);
  assert.equal(productionCalls.length, 2);
  assert.equal(previewCalls[0].values[0], productionCalls[0].values[0]);
});

test("D1 batch失敗を成功扱いにしない", async () => {
  const database = createDatabase([], [{ success: true }, { success: false }]);

  await assert.rejects(
    deleteExpiredSearchData(database, 2_000_000_000),
    /retention cleanup failed/u,
  );
});

function createDatabase(
  calls,
  results = [{ success: true }, { success: true }],
) {
  return {
    prepare(query) {
      return {
        bind(...values) {
          calls.push({ query, values });
          return { query, values };
        },
      };
    },
    async batch(statements) {
      assert.equal(statements.length, 2);
      return results;
    },
  };
}
