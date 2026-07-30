export const onRequestGet: PagesFunction<CloudflareEnv> = async ({ env }) => {
  return Response.json(
    {
      ok: true,
      service: "acecore-schools",
      appUrl: env.PUBLIC_APP_URL ?? "https://schools.acecore.net",
      acecoreNetUrl: env.ACECORE_NET_URL ?? "https://acecore.net",
      searchEnabled: env.SEARCH_ENABLED === "true",
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
};
