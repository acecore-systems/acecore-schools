interface Env {
  ACECORE_NET_URL?: string;
  PUBLIC_APP_URL?: string;
  ALLOWED_ORIGINS?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return Response.json({
    ok: true,
    service: "acecore-schools",
    appUrl: env.PUBLIC_APP_URL ?? "https://schools.acecore.net",
    acecoreNetUrl: env.ACECORE_NET_URL ?? "https://acecore.net",
  });
};
