type SearchMaintenanceEnv = {
  SEARCH_PREVIEW_DB: D1Database;
  SEARCH_PRODUCTION_DB: D1Database;
};

export async function deleteExpiredSearchData(
  database: D1Database,
  now = Math.floor(Date.now() / 1000),
): Promise<void> {
  const results = await database.batch([
    database
      .prepare("DELETE FROM semantic_search_rate_limits WHERE expires_at < ?1")
      .bind(now),
    database
      .prepare("DELETE FROM semantic_search_metrics WHERE expires_at < ?1")
      .bind(now),
  ]);

  if (results.length !== 2 || results.some(({ success }) => !success)) {
    throw new Error("Semantic search retention cleanup failed.");
  }
}

export default {
  async scheduled(
    _controller: ScheduledController,
    env: SearchMaintenanceEnv,
  ): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await Promise.all([
      deleteExpiredSearchData(env.SEARCH_PREVIEW_DB, now),
      deleteExpiredSearchData(env.SEARCH_PRODUCTION_DB, now),
    ]);
  },
} satisfies ExportedHandler<SearchMaintenanceEnv>;
