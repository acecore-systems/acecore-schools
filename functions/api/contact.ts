interface Env {
  ALLOWED_ORIGINS?: string;
  CONTACT_TO_EMAIL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}

type ContactPayload = {
  company?: unknown;
  consent?: unknown;
  course?: unknown;
  email?: unknown;
  message?: unknown;
  name?: unknown;
  phone?: unknown;
};

const json = (
  body: unknown,
  init: ResponseInit = {},
  origin?: string | null,
) => {
  const headers = new Headers(init.headers);
  headers.set("access-control-allow-methods", "POST, OPTIONS");
  headers.set("access-control-allow-headers", "content-type");
  headers.set("cache-control", "no-store");
  headers.set("vary", "Origin");
  if (origin) {
    headers.set("access-control-allow-origin", origin);
  }

  return Response.json(body, {
    ...init,
    headers,
  });
};

const getAllowedOrigin = (request: Request, env: Env) => {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const configured = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (configured.includes(origin)) return origin;

  try {
    const hostname = new URL(origin).hostname;
    if (
      hostname === "schools.acecore.net" ||
      hostname === "acecore-schools.pages.dev" ||
      hostname.endsWith(".acecore-schools.pages.dev")
    ) {
      return origin;
    }
  } catch {
    return "";
  }

  return "";
};

const readPayload = async (request: Request): Promise<ContactPayload> => {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as ContactPayload;
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries()) as ContactPayload;
};

const asString = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

const escapeHtml = (value: string) => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const createEmailBody = (payload: {
  course: string;
  email: string;
  message: string;
  name: string;
  phone: string;
}) => {
  const lines = [
    `お名前: ${payload.name}`,
    `メールアドレス: ${payload.email}`,
    `電話番号: ${payload.phone || "未入力"}`,
    `相談したい内容: ${payload.course || "未選択"}`,
    "",
    "お問い合わせ内容:",
    payload.message,
  ];

  const htmlRows = [
    ["お名前", payload.name],
    ["メールアドレス", payload.email],
    ["電話番号", payload.phone || "未入力"],
    ["相談したい内容", payload.course || "未選択"],
  ]
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 12px;border-bottom:1px solid #d8e5e4;">${escapeHtml(label)}</th><td style="padding:6px 12px;border-bottom:1px solid #d8e5e4;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  return {
    html: `<h1>Acecore Schools お問い合わせ</h1><table cellspacing="0" cellpadding="0">${htmlRows}</table><h2>お問い合わせ内容</h2><p style="white-space:pre-wrap;">${escapeHtml(payload.message)}</p>`,
    text: lines.join("\n"),
  };
};

export const onRequestOptions: PagesFunction<Env> = async ({
  env,
  request,
}) => {
  const allowedOrigin = getAllowedOrigin(request, env);
  if (allowedOrigin === "") {
    return json({ ok: false }, { status: 403 }, null);
  }
  return json({ ok: true }, undefined, allowedOrigin);
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const allowedOrigin = getAllowedOrigin(request, env);
  if (allowedOrigin === "") {
    return json(
      { ok: false, message: "この送信元からは送信できません。" },
      { status: 403 },
      null,
    );
  }

  let payload: ContactPayload;
  try {
    payload = await readPayload(request);
  } catch {
    return json(
      { ok: false, message: "送信内容を読み取れませんでした。" },
      { status: 400 },
      allowedOrigin,
    );
  }

  if (asString(payload.company, 120)) {
    return json({ ok: true }, undefined, allowedOrigin);
  }

  const name = asString(payload.name, 80);
  const email = asString(payload.email, 120);
  const phone = asString(payload.phone, 40);
  const course = asString(payload.course, 80);
  const message = asString(payload.message, 2000);
  const consent = payload.consent === "yes" || payload.consent === "on";

  if (!name || !email || !message || !consent) {
    return json(
      { ok: false, message: "必須項目を入力してください。" },
      { status: 400 },
      allowedOrigin,
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(
      { ok: false, message: "メールアドレスを確認してください。" },
      { status: 400 },
      allowedOrigin,
    );
  }

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.RESEND_FROM_EMAIL) {
    return json(
      {
        ok: false,
        message:
          "問い合わせフォームの送信設定が未完了です。時間をおいて再度お試しください。",
      },
      { status: 503 },
      allowedOrigin,
    );
  }

  const emailBody = createEmailBody({ course, email, message, name, phone });
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `Acecore Schools お問い合わせ: ${name}`,
      text: emailBody.text,
      html: emailBody.html,
    }),
  });

  if (!resendResponse.ok) {
    return json(
      {
        ok: false,
        message:
          "送信処理でエラーが発生しました。時間をおいて再度お試しください。",
      },
      { status: 502 },
      allowedOrigin,
    );
  }

  return json({ ok: true }, undefined, allowedOrigin);
};
