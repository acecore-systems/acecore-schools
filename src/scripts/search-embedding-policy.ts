import modelConfig from "../../config/ai-models.generated.json" with { type: "json" };

// The existing Voyage Vectorize index was built in this model's embedding space.
const VOYAGE_INDEX_MODEL = "voyage-4-lite";
const selection = modelConfig?.features?.["search.embedding"];

export const VOYAGE_EMBEDDING_MODEL =
  modelConfig?.schema_version === 1 &&
  selection?.profile === "embedding.default" &&
  selection.provider === "mongodb" &&
  selection.execution_mode === "realtime" &&
  selection.api_model_id === VOYAGE_INDEX_MODEL
    ? selection.api_model_id
    : null;
