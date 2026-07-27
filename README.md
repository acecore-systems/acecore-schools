# Acecore Schools

Acecore Schools の公開案内を担当する Astro アプリケーションです。
`acecore.net` 本体に Schools runtime を載せず、別 repo / 別 Cloudflare Pages project として管理します。

現在の正式な申込導線は LINE または Acecore の問い合わせフォームからの無料相談です。
予約、会員ポータル、外部カレンダー連携、Schools 用 Stripe は将来計画であり、現行の公開機能ではありません。

## Service Boundary

| Area              | Current responsibility                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| `acecore.net`     | Schools への外部導線、旧 `/schools/` リダイレクト、問い合わせ導線         |
| `acecore-schools` | Schools 紹介ページ、ページ別 SEO、無料相談 CTA、Pages Functions の health |
| Acecore Accounts  | 将来の共通ログイン基盤。現行サイトでは未使用                              |

`acecore.net` は予約 DB、Schools の Stripe webhook、会員 session、ICS token を持ちません。
将来、予約機能を実装する場合は、予約作成・変更・キャンセルをこの app の portal/API に集約します。
Outlook などの外部カレンダー連携は read-only ICS feed に限定する計画です。

## Deployment

- Platform: Cloudflare Pages
- Project name: `acecore-schools`
- Production domain: `schools.acecore.net`
- Build command: `npm run build`
- Build output: `dist`
- Runtime functions: `functions/`
- Production deployment: GitHub repository integration

`deploy:preview` は開発時の確認用です。Direct Upload を本番完了条件にせず、GitHub の push deploy と custom domain の状態を確認します。

初期状態では deploy を壊さないため、D1 binding は `wrangler.jsonc` にまだ固定していません。
最初の予約 DB migration を追加する Issue で、preview / production の D1 database id を作成してから binding を追加します。

## Planned Runtime

### D1

Planned binding: `SCHOOLS_DB`

想定テーブル:

- guardians
- students
- instructors
- courses
- availability_slots
- bookings
- booking_events
- calendar_feeds
- stripe_events

### Secrets

Cloudflare Pages の preview / production に分けて設定します。

- `CLERK_SECRET_KEY`
- `PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `SCHOOLS_ICS_TOKEN_PEPPER`

### Vars

`wrangler.jsonc` で管理します。

- `ACECORE_NET_URL`
- `PUBLIC_APP_URL`
- `ALLOWED_ORIGINS`

## Development

必要な環境:

- Node.js 24.18.0 以上（`.node-version` を参照）
- npm
- Astro v7

```bash
npm install
npm run dev
npm run build
```

Routes:

```text
/
/learning/
/how-it-works/
/pricing/
/about/
/faq/
/api/health
```

## References

- acecore-systems/acecore-net#11
- acecore-systems/acecore-net#122
- acecore-systems/acecore-net#113
