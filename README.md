# Acecore Schools

Acecore Schools の予約、会員ポータル、外部カレンダー連携を担当するアプリケーションです。
`acecore.net` 本体に Schools runtime を載せず、別 repo / 別 Cloudflare Pages project として管理します。

## Service Boundary

| Area              | Responsibility                                                                     |
| ----------------- | ---------------------------------------------------------------------------------- |
| `acecore.net`     | Schools の紹介、SEO、無料体験 CTA、問い合わせ導線                                  |
| `acecore-schools` | 無料体験予約、会員ポータル、予約変更・キャンセル、read-only ICS、Schools 用 Stripe |
| Acecore Accounts  | 共通ログイン、共通 user id、メール確認、パスワードリセット                         |

`acecore.net` は予約 DB、Schools の Stripe webhook、会員 session、ICS token を持ちません。
Schools の予約作成・変更・キャンセルはこの app の portal/API からのみ行います。
Outlook などの外部カレンダー連携は read-only ICS feed に限定します。

## Deployment

- Platform: Cloudflare Pages
- Project name: `acecore-schools`
- Production domain: `schools.acecore.net`
- Build command: `npm run build`
- Build output: `dist`
- Runtime functions: `functions/`

初期状態では deploy を壊さないため、D1 binding は `wrangler.jsonc` にまだ固定していません。
最初の予約 DB migration を追加する Issue で、preview / production の D1 database id を作成してから binding を追加します。

## Runtime Plan

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

```bash
npm install
npm run dev
npm run build
```

Health check:

```text
/api/health
```

## References

- acecore-systems/acecore-net#11
- acecore-systems/acecore-net#122
- acecore-systems/acecore-net#113
