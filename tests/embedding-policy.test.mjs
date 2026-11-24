import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import modelConfig from "../config/ai-models.generated.json" with { type: "json" };

const updatedConfig = structuredClone(modelConfig);
updatedConfig.features["search.embedding"].api_model_id = "voyage-future-model";

const hook = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "../../config/ai-models.generated.json") {
      return {
        url:
          "data:application/json," +
          encodeURIComponent(JSON.stringify(updatedConfig)),
        shortCircuit: true,
      };
    }
    return nextResolve(specifier, context);
  },
});
const { onRequestPost } = await import("../functions/api/search.ts");
const { VOYAGE_INDEX_NAME, probeVoyageDocument, syncVectorize } =
  await import("../scripts/sync-vectorize.mjs");
hook.deregister();

test("同じ次元の別モデルを配布しても既存Voyage索引への検索・同期を拒否する", async (t) => {
  const unexpected = t.mock.fn(() => {
    throw new Error("Unexpected external request");
  });
  for (const model of ["voyage-4-lite", "voyage-future-model"]) {
    const response = await onRequestPost({
      request: new Request("https://schools.acecore.net/api/search", {
        method: "POST",
        headers: {
          Origin: "https://schools.acecore.net",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: "プログラミング", locale: "ja" }),
      }),
      env: {
        SEARCH_ENABLED: "true",
        SEARCH_EMBEDDING_MODEL: model,
        SEARCH_EMBEDDING_DIMENSIONS: "1024",
        SEARCH_RATE_LIMIT_SECRET: "x".repeat(32),
        SEARCH_RATE_LIMIT_DB: { prepare: unexpected },
        SEARCH_INDEX: { query: unexpected },
        VOYAGE_EMBEDDER: { fetch: unexpected },
        AI: { run: unexpected },
      },
      waitUntil() {},
    });
    assert.equal(response.status, 503);
  }

  await assert.rejects(
    syncVectorize({
      indexName: VOYAGE_INDEX_NAME,
      voyageApiKey: "synthetic",
      fetchImpl: unexpected,
    }),
    /incompatible with the existing Voyage index/u,
  );
  await assert.rejects(
    probeVoyageDocument({ voyageApiKey: "synthetic", fetchImpl: unexpected }),
    /incompatible with the existing Voyage index/u,
  );
  assert.equal(unexpected.mock.callCount(), 0);
});
