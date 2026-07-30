# Cloudflare Vectorize semantic search

Acecore Schools の公開ページを、日本語の自然文から探すための検索基盤です。予約、問い合わせ、
会員情報は索引へ含めません。公開 UI は別の変更として扱い、この構成では同一 origin の
`POST /api/search` と安全な同期経路を提供します。

## Current rollout state

| Environment | Vectorize index                     | Rate-limit D1                       | Search |
| ----------- | ----------------------------------- | ----------------------------------- | ------ |
| Preview     | `acecore-schools-search-preview`    | `acecore-schools-search-preview`    | ON     |
| Production  | `acecore-schools-search-production` | `acecore-schools-search-production` | OFF    |

Production は `SEARCH_ENABLED=false` です。Production index の同期、公開 UI、ブラウザ QA、
費用とエラー率の確認が終わるまで有効化しません。

## Data flow

1. `npm run build` が Astro の公開 HTML を `dist/` に生成します。
2. `scripts/build-search-corpus.mjs` が `<main>` の公開本文だけを抽出し、
   `.vectorize/corpus.json` を生成します。
3. `scripts/sync-vectorize.mjs` が Workers AI の `@cf/baai/bge-m3` で 1024 次元の
   embedding を生成し、`ja` namespace へ upsert します。
4. `/api/search` が同じモデルで質問を embedding し、Vectorize の cosine 類似検索結果を
   最大5ページへ正規化します。
5. D1 がクライアント10回/分、全体20回/分の上限を原子的に管理します。

Corpus 生成は404、`noindex`、ナビゲーション、フォーム、フッター、装飾文を除外します。
必須6 route、最低6 source、最低6 vector、`ja` のみという検証を通らない場合は build と同期を
停止します。IDは本文を含むハッシュなので、内容変更は新しいvectorとして扱われます。

## Search API

ブラウザから同一 origin の JSON POST として呼び出します。質問は2〜160文字、request bodyは
2 KiB以下、localeは`ja`だけを受け付けます。

```js
const response = await fetch("/api/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: "パソコン初心者でも相談できますか",
    locale: "ja",
  }),
});
const payload = await response.json();
```

成功時は`results`にroot-relative URL、title、section、excerpt、contentType、rankを返します。
質問本文はlogへ残しません。キルスイッチ、binding、D1、Workers AI、Vectorizeのいずれかが
利用できなければfail closedし、検索結果を推測で返しません。

## Bindings

`wrangler.jsonc` は Cloudflare Pages 設定の source of truth です。Workers AI、Vectorize、
D1、vars は environment 間で暗黙継承されないため、Preview と Production にそれぞれ
明示しています。

| Binding                | Purpose                              |
| ---------------------- | ------------------------------------ |
| `AI`                   | BGE-M3 query/corpus embedding        |
| `SEARCH_INDEX`         | Environment-specific Vectorize index |
| `SEARCH_RATE_LIMIT_DB` | Search rate-limit counters only      |
| `SEARCH_ENABLED`       | Fail-closed runtime kill switch      |
| `SEARCH_MIN_SCORE`     | Minimum cosine similarity score      |

ローカルの top-level 設定は Preview リソースを指しますが、`SEARCH_ENABLED=false` です。
`remote: true` の binding は実 Cloudflare リソースへ接続し、Workers AI の利用と書き込みが
発生し得ます。ローカル確認のためにキルスイッチを変更する場合も Production を指定しないで
ください。

## Build and validation

Node.js 24.18.0 以上で実行します。

```bash
npm ci
npm run format:check
npm run test:search
npm run types:cloudflare:check
npm run check:pages-config
npm run typecheck:functions
npm run build
npm run sync:vectorize:dry-run
```

`wrangler.jsonc` の binding を変更した場合は、生成型も更新して commit します。

```bash
npm run types:cloudflare
```

## D1 migration

`migrations/search/` は検索回数制御専用です。2026-07-30に現在のPreview／Production D1へ
`0001_create_semantic_search_rate_limits.sql`を適用し、テーブルとexpires indexを確認済みです。
D1を再作成した場合や新しいenvironmentを追加した場合は、検索を有効にする前にbinding名を
environmentごとに解決して適用します。

```powershell
npx wrangler d1 migrations apply SEARCH_RATE_LIMIT_DB --remote --env preview
npx wrangler d1 migrations apply SEARCH_RATE_LIMIT_DB --remote --env production
```

Wranglerは適用前に対象migrationの確認を求め、適用時にbackupを取得します。対象database名と
environmentを確認してから承認してください。

## Preview sync

同期には、対象アカウントの Workers AI Read と Vectorize Write に限定した API token を使います。
token をログ、引数、repositoryへ残さないでください。

```powershell
$env:CLOUDFLARE_ACCOUNT_ID = "<account-id>"
$env:CLOUDFLARE_API_TOKEN = "<scoped-token>"
$env:VECTORIZE_INDEX_NAME = "acecore-schools-search-preview"
npm run sync:vectorize
```

同期処理は対象 index 名を2件に限定し、index を暗黙作成しません。既存の管理外IDを検出した場合、
または削除が既存vectorの20%を超える場合は変更前に停止します。upsert/delete 後は
`processedUpToMutation` を待ち、最終ID集合の一致を検証します。

## Production gate

Production 同期は通常の同期コマンドでは実行できません。リリース承認後に、Production indexが
1024 dimensions / cosine であること、Production D1 migration、corpus件数、Preview検索結果を
再確認してから明示フラグを付けます。

```powershell
$env:VECTORIZE_INDEX_NAME = "acecore-schools-search-production"
npm run sync:vectorize -- --confirm-production
```

同期後も検索は無効です。有効化は `wrangler.jsonc` の Production
`SEARCH_ENABLED` を `true` にする別PRで行い、GitHub連携によるPages deployment、
`schools.acecore.net` のcustom domain、TLS、`/api/health`、`/api/search` を確認します。
Direct Upload はProduction完了条件にしません。

Rollback は Production の `SEARCH_ENABLED=false` をGitHub経由でdeployする操作です。
indexやD1を削除する必要はありません。

## References

- [Vectorize introduction](https://developers.cloudflare.com/vectorize/get-started/intro/)
- [Vectorize limits](https://developers.cloudflare.com/vectorize/platform/limits/)
- [Vectorize client API](https://developers.cloudflare.com/vectorize/reference/client-api/)
- [BGE-M3 model](https://developers.cloudflare.com/workers-ai/models/bge-m3/)
- [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
