# Cloudflare Vectorize semantic search

Acecore Schools の公開ページを、日本語の自然文から探すための検索基盤です。予約、問い合わせ、
会員情報は索引へ含めません。同一 origin の`POST /api/search`、公開検索 UI、安全な同期経路、
匿名の運用メトリクスを提供します。

## Current rollout state

| Environment | Vectorize index                     | Search D1                           | Vectors | Search |
| ----------- | ----------------------------------- | ----------------------------------- | ------: | ------ |
| Preview     | `acecore-schools-search-preview`    | `acecore-schools-search-preview`    |       6 | ON     |
| Production  | `acecore-schools-search-production` | `acecore-schools-search-production` |       6 | OFF    |

2026-07-30に両D1へmigration `0001`〜`0003`を適用し、同じ6件のcorpusを両indexへ収束させました。
同日、公開routeを持たない`acecore-schools-search-maintenance`をdeployし、
cron `17 * * * *`をCloudflare APIで確認しました。
Production は `SEARCH_ENABLED=false` のため、health確認に連動した検索UIも表示されません。
実装PRのPreview QAとマージ後、別の有効化PRで`true`へ変更します。

## Data flow

1. `npm run build` が Astro の公開 HTML を `dist/` に生成します。
2. `scripts/build-search-corpus.mjs` が `<main>` の公開本文だけを抽出し、
   `.vectorize/corpus.json` を生成します。
3. `scripts/sync-vectorize.mjs` が Workers AI の `@cf/baai/bge-m3` で 1024 次元の
   embedding を生成し、`ja` namespace へ upsert します。
4. `/api/search` が同じモデルで質問を embedding し、Vectorize の cosine 類似検索結果を
   最大5ページへ正規化します。
5. D1 がクライアント10回/分、全体20回/分を1 SQL statementで同時判定し、片方が上限なら
   client・globalのどちらも増やしません。
6. レート制限を通過した検索だけをD1へUTC時別に集計し、成功数、エラー、0件、結果数、
   latencyを約90日保持します。

Corpus 生成は404、`noindex`、ナビゲーション、フォーム、フッター、装飾文を除外します。
必須6 route、最低6 source、最低6 vector、`ja` のみという検証を通らない場合は build と同期を
停止します。IDは本文を含むハッシュなので、内容変更は新しいvectorとして扱われます。
同期時は既存IDも含むreview済みcorpus全件を再embedding・upsertするため、metadataやvaluesの
意図しないdriftも上書きします。

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

検索UIは`GET /api/health`の`searchEnabled`が`true`のときだけ導線とフォームを表示します。
有効化前やrollback後は静的ページと既存ナビゲーションをそのまま利用できます。

## Bindings

`wrangler.jsonc` は公開可能な Cloudflare Pages 設定の source of truth です。Workers AI、
Vectorize、D1、vars は environment 間で暗黙継承されないため、Preview と Production に
それぞれ明示しています。`SEARCH_RATE_LIMIT_SECRET`だけはrepositoryへ値を置かず、Pagesの
Preview／Productionへ別々の暗号化secret bindingとして設定します。

| Binding                    | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `AI`                       | BGE-M3 query/corpus embedding                  |
| `SEARCH_INDEX`             | Environment-specific Vectorize index           |
| `SEARCH_RATE_LIMIT_DB`     | Rate limits and hourly search metrics          |
| `SEARCH_RATE_LIMIT_SECRET` | Encrypted HMAC key for pseudonymous client key |
| `SEARCH_ENABLED`           | Fail-closed runtime kill switch                |
| `SEARCH_MIN_SCORE`         | Minimum cosine similarity score                |

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
npm run check:maintenance-config
npm run typecheck:functions
npm run build
npm run sync:vectorize:dry-run
```

`wrangler.jsonc` の binding を変更した場合は、生成型も更新して commit します。

```bash
npm run types:cloudflare
```

## D1 migration

`migrations/search/` は検索回数制御と匿名の時間集計専用です。2026-07-30に現在の
Preview／Production D1へ`0001_create_semantic_search_rate_limits.sql`と
`0002_create_semantic_search_metrics.sql`、`0003_index_semantic_search_metrics_expiry.sql`を
Wrangler経由で適用し、migration履歴とschemaを確認済みです。D1を再作成した場合や新しい
environmentを追加した場合は、検索を有効にする前にdatabase名とenvironmentを明示して適用します。

```powershell
npx wrangler d1 migrations apply SEARCH_RATE_LIMIT_DB --remote --env preview
npx wrangler d1 migrations apply SEARCH_RATE_LIMIT_DB --remote --env production
```

Wranglerは適用前に対象migrationの確認を求め、適用時にbackupを取得します。対象database名と
environmentを確認してから承認してください。

## Environment sync

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
`processedUpToMutation` を待ち、最終ID集合の一致を検証します。IDが既に存在していてもcorpus
全件をupsertするため、本文・metadata・namespace・embeddingをreview済み入力へ戻せます。
List Vectors APIへ送るquery parameterは公式仕様の`count`と`cursor`だけです。namespaceは
各vectorの書き込みとqueryで`ja`を指定します。

## Production gate

Production 同期は通常の同期コマンドでは実行できません。Production indexが
1024 dimensions / cosineであること、Production D1 migration、corpus件数、Preview検索結果を
再確認してから明示フラグを付けます。2026-07-30の同期は6件upsert、0件deleteで収束しました。

```powershell
$env:VECTORIZE_INDEX_NAME = "acecore-schools-search-production"
npm run sync:vectorize -- --confirm-production
```

検索対象のHTML・`src/data/`・corpus生成処理を変更するPRは、merge前にcorpus buildとPreview
同期を行い、merge後のProduction有効化前にProduction同期を再実行します。別の本文変更PRが
同時に開いている場合はmerge順を固定し、後からmergeする側でreview済みcorpusをbuildして
Preview、Productionの順に全件upsertします。同期完了をPagesの公開内容と独立して確認します。

同期後も検索は無効です。有効化は`wrangler.jsonc`のProduction `SEARCH_ENABLED`を`true`にする
別PRで行います。完了判定は次をすべて満たした状態です。

1. PagesのGit ProviderがYes、source repositoryが`acecore-systems/acecore-schools`、
   production branchが`main`である。
2. Preview／Productionの両方に、別々に生成した32 bytes以上の
   `SEARCH_RATE_LIMIT_SECRET`が暗号化bindingとして存在する。
3. `acecore-schools-search-maintenance`の最新deploymentがrepoのconfigと一致し、cron
   `17 * * * *`と成功したscheduled eventを確認できる。
4. GitHub push deploymentが成功し、Pages deploymentのSource SHAが有効化PRのmerge SHAと
   一致する。Direct UploadはProduction完了条件にしない。
5. `schools.acecore.net`のcustom domainがactiveで、TLSが正常である。
6. `/api/health`の`searchEnabled`が`true`で、desktop/mobileの公開UI、既知query、結果リンクを
   実ブラウザで確認する。
7. Production D1の時間集計が1件増え、リアルタイムlogに5xxやprovider errorがない。

障害時はまずCloudflare Pagesで直前の`SEARCH_ENABLED=false`の成功済みProduction deploymentへ
rollbackし、`/api/health`、UI非表示、`POST /api/search`の503を確認します。続けて
`SEARCH_ENABLED=false`へ戻すGit PRをmergeし、Gitと実環境を再一致させます。indexやD1を
削除する必要はありません。

## Monitoring

各検索は`semantic_search_completed`を1件だけ構造化logへ出します。含むのはrequest ID、locale、
有限のoutcome/stage、HTTP status、結果数、0件判定、latencyだけです。質問、IP、client ID、
client hash、例外messageはlogや時間集計へ保存しません。レート制限tableだけは
`CF-Connecting-IP`または匿名session IDを環境secretでHMAC-SHA-256化したclient keyを保存します。
平文IPとsecretはD1へ保存しません。client keyには約10分の期限を付け、許可された次の検索と
毎時17分のmaintenance Workerで期限切れ行を削除します。通常は期限後の次回検索、検索が
止まっていても次の毎時cleanupまでに削除されます。

時間集計には期限を設定し、許可された検索ごとと毎時cleanupで90日を超えたUTC hourを削除します。
したがって保持は厳密な90日ではなく、最大で次の毎時cleanupまで延びます。Pages Functionsのlogは
リアルタイムで保存されないため、
レート制限を通過した検索は`semantic_search_metrics`へUTC時別に集計します。レート制限前の403、
415、429などは時間集計のD1書き込みを増やさず、Pages Functions Metricsとリアルタイムlogで
確認します。

`acecore-schools-search-maintenance`はPreview／Production D1だけをbindingしたscheduled Worker
です。サイト本体のPages deploymentとは分離し、変更時はdry-run後にdeployしてcronを確認します。

```powershell
npm run check:maintenance-config
npx wrangler deploy --config wrangler.maintenance.jsonc
npx wrangler deployments list --name acecore-schools-search-maintenance
```

deploy出力とCloudflare dashboardでcronが`17 * * * *`であることも確認します。

直近24時間の永続集計は次で確認できます。

```sql
SELECT
  datetime(hour_start, 'unixepoch') AS hour_utc,
  outcome,
  stage,
  status,
  SUM(request_count) AS requests,
  SUM(result_count_total) AS results,
  SUM(zero_result_count) AS zero_results,
  ROUND(1.0 * SUM(latency_ms_total) / SUM(request_count), 1) AS avg_latency_ms,
  MAX(latency_ms_max) AS max_latency_ms
FROM semantic_search_metrics
WHERE hour_start >= unixepoch() - 86400
GROUP BY hour_start, outcome, stage, status
ORDER BY hour_start DESC, outcome, stage;
```

Pages dashboardではrequest、invocation status、CPU time、durationを最大3か月確認できます。リリース時は
HTTP 5xx、`provider_error`／`internal_error`、0件率、平均・最大latency、Workers AI neurons、
Vectorize queried dimensions、D1 rows writtenを一緒に確認します。

## Cost guardrails

2026-07-30時点の公式価格では、BGE-M3は100万input tokenあたり$0.012
（1,075 neurons）、Workers AIの無料枠は1日10,000 neuronsです。VectorizeはFreeで月3,000万
queried dimensions／500万stored dimensions、Paidで最初の5,000万／1,000万が含まれます。
現在の保存量は`6 vectors × 1,024 dimensions = 6,144 stored dimensions`です。

全体上限20検索/分が30日間続く仮定では、最大864,000 query、約884.7 million queried dimensions
です。Paidのincluded分を超えるVectorize query費用は現行単価で約$8.35/月となる計算です。
これは上限からの試算であり実績ではありません。

client/global判定は1 statementで、許可時だけ2行をinsert/updateします。global上限後に新しいIPを
送ってもclient行を追加しないため、D1 rows writtenは検索上限とcleanup対象行で抑えられます。
一方、公開endpointへのHTTP requestと上限判定のD1 query自体は20回/分の外側なので、Pages
Functions requests、D1 rows read、WAFイベントも監視します。急増、D1 error、想定外の費用を
検知した場合は`SEARCH_ENABLED=false`へrollbackします。

## References

- [Vectorize introduction](https://developers.cloudflare.com/vectorize/get-started/intro/)
- [Vectorize limits](https://developers.cloudflare.com/vectorize/platform/limits/)
- [Vectorize client API](https://developers.cloudflare.com/vectorize/reference/client-api/)
- [BGE-M3 model](https://developers.cloudflare.com/workers-ai/models/bge-m3/)
- [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Pages Functions metrics](https://developers.cloudflare.com/pages/functions/metrics/)
- [Pages Functions logging](https://developers.cloudflare.com/pages/functions/debugging-and-logging/)
- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Vectorize pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
