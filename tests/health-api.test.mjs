import assert from "node:assert/strict";
import { test } from "node:test";

import { onRequestGet } from "../functions/api/health.ts";

test("healthは検索kill switchをbooleanで公開する", async () => {
  const enabledResponse = await onRequestGet({
    env: {
      PUBLIC_APP_URL: "https://schools.acecore.net",
      ACECORE_NET_URL: "https://acecore.net",
      SEARCH_ENABLED: "true",
    },
  });
  const disabledResponse = await onRequestGet({
    env: {
      PUBLIC_APP_URL: "https://schools.acecore.net",
      ACECORE_NET_URL: "https://acecore.net",
      SEARCH_ENABLED: "false",
    },
  });

  assert.equal(enabledResponse.status, 200);
  assert.equal(disabledResponse.status, 200);
  assert.equal(enabledResponse.headers.get("Cache-Control"), "no-store");
  assert.equal(
    enabledResponse.headers.get("X-Content-Type-Options"),
    "nosniff",
  );
  assert.equal((await enabledResponse.json()).searchEnabled, true);
  assert.equal((await disabledResponse.json()).searchEnabled, false);
});
