CREATE TABLE IF NOT EXISTS semantic_search_metrics (
  hour_start INTEGER NOT NULL,
  outcome TEXT NOT NULL CHECK (
    outcome IN (
      'success',
      'client_error',
      'rate_limited',
      'unavailable',
      'provider_error',
      'internal_error'
    )
  ),
  stage TEXT NOT NULL CHECK (
    stage IN (
      'request',
      'origin',
      'content_type',
      'availability',
      'rate_limit',
      'payload',
      'embedding',
      'vectorize',
      'complete'
    )
  ),
  status INTEGER NOT NULL CHECK (status BETWEEN 100 AND 599),
  request_count INTEGER NOT NULL DEFAULT 1 CHECK (request_count >= 1),
  zero_result_count INTEGER NOT NULL DEFAULT 0 CHECK (zero_result_count >= 0),
  result_count_total INTEGER NOT NULL DEFAULT 0 CHECK (result_count_total >= 0),
  latency_ms_total INTEGER NOT NULL DEFAULT 0 CHECK (latency_ms_total >= 0),
  latency_ms_max INTEGER NOT NULL DEFAULT 0 CHECK (latency_ms_max >= 0),
  expires_at INTEGER NOT NULL,
  PRIMARY KEY (hour_start, outcome, stage, status)
) WITHOUT ROWID, STRICT;
