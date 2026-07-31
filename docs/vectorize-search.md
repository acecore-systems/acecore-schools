# Cloudflare Vectorize semantic search

Acecore Schools の公開ページを、日本語の自然文から探すための検索基盤です。予約、問い合わせ、
会員情報は索引へ含めません。同一 origin の`POST /api/search`、公開検索 UI、安全な同期経路、
匿名の運用メトリクスを提供します。

## Current rollout state

| Environment | Vectorize index                                 | Search D1                           | Index state | Search |
| ----------- | ----------------------------------------------- | ----------------------------------- | ----------- | ------ |
| Preview     | bindingなし                                     | `acecore-schools-search-preview`    | 対象外      | OFF    |
| Production  | `acecore-schools-search-openai-1536-production` | `acecore-schools-search-production` | 7件同期済み | ON     |

Pages PreviewはVectorizeを利用せず、静的ページと既存ナビゲーションを確認する環境です。
2026-07-31のProduction run `30599692065`でmain corpus 7件を1536次元indexへ同期し、
1536 dimensions / cosine、vector件数7、`ja` namespaceのqueryを照合済みです。
Productionの`SEARCH_ENABLED=true`を維持します。

2026-07-30に両D1へmigration `0001`〜`0003`を適用し、当時のcorpusを旧BGE-M3用
Preview／Production indexへ収束させました。この実績は新しい1536次元indexへ引き継ぎません。
同日、公開routeを持たない`acecore-schools-search-maintenance`をdeployし、cron `17 * * * *`を
Cloudflare APIで確認しました。旧BGE-M3用1024次元indexはrollback確認が終わるまで削除しません。

その後の本文追加でmain corpusが7件になったため、`.github/workflows/sync-vectorize.yml`は
Productionをmain push直後と6時間ごとに公開buildへ再収束させ、手動再実行にも対応します。
各成功runは同期対象corpusと構造化sync logをGitHub Actions artifactとして保存します。

## Data flow

1. `npm run build` が Astro の公開 HTML を `dist/` に生成します。
2. `scripts/build-search-corpus.mjs` が `<main>` の公開本文だけを抽出し、
   `.vectorize/corpus.json` を生成します。
3. `scripts/write-build-meta.mjs`がGitHub連携Pagesから渡されるcommitとcorpus identityを
   `/.well-known/acecore-schools-build.json`へ出力します。
4. `scripts/sync-vectorize.mjs` が OpenAI Embeddings API の `text-embedding-3-large`へ
   `dimensions: 1536`を指定してembeddingを生成し、`ja` namespaceへupsertします。
5. `/api/search` が同じモデルで質問を embedding し、Vectorize の cosine 類似検索結果を
   最大5ページへ正規化します。
6. D1 がクライアント10回/分、全体20回/分を1 SQL statementで同時判定し、片方が上限なら
   client・globalのどちらも増やしません。
7. レート制限を通過した検索だけをD1へUTC時別に集計し、成功数、エラー、0件、結果数、
   latencyを約90日保持します。

Corpus 生成は404、`noindex`、ナビゲーション、フォーム、フッター、装飾文を除外します。
必須6 route、最低6 source、最低6 vector、`ja` のみという検証を通らない場合は build と同期を
停止します。IDはlocale、URL、chunk slotから安定生成し、本文変更はcorpus versionで検出します。
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
質問本文はlogへ残しません。キルスイッチ、OpenAI API key、D1、OpenAI、Vectorizeのいずれかが
利用できなければfail closedし、検索結果を推測で返しません。

検索UIは`GET /api/health`の`searchEnabled`が`true`のときだけ導線とフォームを表示します。
有効化前やrollback後は静的ページと既存ナビゲーションをそのまま利用できます。

## Bindings

`wrangler.jsonc` は公開可能な Cloudflare Pages 設定の source of truth です。Vectorize bindingは
Productionだけに置き、top-levelとPreviewには置きません。D1とvarsはenvironment間で暗黙継承
されないため、必要な環境へ明示しています。`OPENAI_API_KEY`と`SEARCH_RATE_LIMIT_SECRET`は
repositoryへ値を置かず、Production Pagesの暗号化secret bindingとして設定します。

| Binding                       | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `OPENAI_API_KEY`              | OpenAI project service-account key             |
| `OPENAI_EMBEDDING_MODEL`      | Fixed embedding model identity                 |
| `OPENAI_EMBEDDING_DIMENSIONS` | Fixed Vectorize-compatible dimensions          |
| `SEARCH_INDEX`                | Production-only Vectorize index                |
| `SEARCH_RATE_LIMIT_DB`        | Rate limits and hourly search metrics          |
| `SEARCH_RATE_LIMIT_SECRET`    | Encrypted HMAC key for pseudonymous client key |
| `SEARCH_ENABLED`              | Fail-closed runtime kill switch                |
| `SEARCH_MIN_SCORE`            | Minimum cosine similarity score                |

top-levelとPreviewは`SEARCH_ENABLED=false`で、`SEARCH_INDEX`を持ちません。検索UIはhealthの
kill switchに従って表示されず、`POST /api/search`もembeddingやVectorize queryの前に503で
fail closedします。ローカルやPR PreviewからProduction indexへ直接接続しません。

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

`npm run build`は`.vectorize/corpus.json`に加えて
`dist/.well-known/acecore-schools-build.json`を生成します。Cloudflare Pagesでは
`CF_PAGES_COMMIT_SHA`、GitHub Actionsでは明示した`COMMIT_SHA`を使い、ローカルでは現在の
Git HEADを使います。

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

同期には、対象CloudflareアカウントのVectorize Read／Writeだけに限定したAPI tokenと、
Schools専用OpenAI projectのservice-account keyを別々に使います。どちらもログ、引数、
repositoryへ残さないでください。

```powershell
$env:CLOUDFLARE_ACCOUNT_ID = "<account-id>"
$env:CLOUDFLARE_API_TOKEN = "<scoped-token>"
$env:OPENAI_API_KEY = "<schools-project-key>"
$env:VECTORIZE_INDEX_NAME = "acecore-schools-search-openai-1536-production"
npm run sync:vectorize
```

GitHub Actionsでは次のEnvironmentをmain限定で作成し、同名のsecretへProduction tokenを保存します。

| GitHub Environment                     | Secrets                                                            |
| -------------------------------------- | ------------------------------------------------------------------ |
| `cloudflare-schools-search-production` | `CLOUDFLARE_SCHOOLS_SEARCH_PRODUCTION_API_TOKEN`, `OPENAI_API_KEY` |

Productionのpush／schedule自動同期はrepository variable
`SCHOOLS_VECTORIZE_SYNC_ENABLED=true`の場合だけ起動します。手動Production dispatchは
障害修復のため、このvariableが未設定でも実行できます。

Production jobは公開markerが指すcommitを再buildし、commit、corpus version、source count、
vector countが公開中の値と一致した場合だけ同期します。mutation後も同じ公開identityを再確認します。
push runは対象commitが公開されるまで最大10分待ち、schedule／manual runは現在公開中のcommitを
mainの祖先と確認して再収束します。

公開commitの依存関係install、テスト、buildはsecretを持たないjobで実行し、検証済みcorpusを
短期artifactへ固定します。Production tokenを使うjobはイベント時のmain verifierを改めて
checkoutし、artifactのSHA-256とcorpus versionを再検証してから、そのverifierの同期scriptだけを
実行します。公開中の古いcommitへProduction tokenを渡しません。

同期処理は対象index名をProductionの1件に限定し、indexを暗黙作成しません。既存の管理外IDを検出した場合、
または削除が既存vectorの20%を超える場合は変更前に停止します。upsert/delete 後は
`processedUpToMutation` を待ち、最終ID集合の一致を検証します。既存vectorのID、namespace、
metadata内の本文・metadata・embedding／chunk設定digestがcorpusとすべて一致する場合はno-opとし、
OpenAIとmutationを呼びません。一致しない場合はcorpus全件をupsertして、本文・metadata・
namespace・embeddingをreview済み入力へ戻します。List Vectors APIへ送るquery parameterは
公式仕様の`count`と`cursor`だけです。namespaceは各vectorの書き込みとqueryで`ja`を指定します。

自動同期で通常の本文変更が20%削除gateへ掛からないよう、vector IDは`schools-v2`として
locale、URL、chunk slotから安定生成します。corpus versionは本文、metadata、embedding設定、
chunk設定を含む全内容hashなので、本文変更時はIDを維持しつつ公開identityが更新されます。
既存`schools-v1`からの初回移行だけは全ID置換になります。Productionにv1 IDが存在する場合だけ、
GitHub Actionsのmanual dispatchで`migration=v1-to-v2`を選びます。この限定モードは削除対象がv1、
期待IDがv2である場合にしか20%超削除を許可せず、通常の大規模削除overrideには使えません。
Production migrationも公開marker、GitHub Environment、corpus SHA-256、corpus versionの検証を
迂回しません。新しい空indexへの初回同期では`migration=none`を使います。

各実行はtokenを含まない`receipt.json`を作成し、attemptからsuccessまたはfailureへ状態を更新します。
GitHubのrun情報、対象index、corpus version、no-op、mutation ID、件数をsync logと一緒にartifactへ
保存します。失敗時も`if: always()`で取得できる範囲の証跡をアップロードします。

## Production gate

Production 同期は通常の同期コマンドでは実行できません。Production indexが
1536 dimensions / cosineであること、Production D1 migration、corpus件数を再確認し、
GitHub Actionsのmanual dispatchまたは有効化済みのpush／scheduleから実行します。同期scriptも
公開markerと一致したcorpus versionそのものを確認値として要求します。2026-07-30の6件upsert、
0件deleteは旧BGE-M3用indexの証跡であり、新しい1536次元indexの収束証跡として扱いません。
新しいindexは2026-07-31のProduction run `30599692065`でmain corpus 7件へ収束させ、
vector件数と`ja` namespace queryを確認しました。

検索対象のHTML・`src/data/`・corpus生成処理を変更するPRは、merge前にcorpus buildとdry-runを
行い、merge後に公開されたcommitをProductionへ同期します。別の本文変更PRが同時に開いている場合は
merge順を固定し、後からmergeする側の公開corpusへProductionを再収束させます。同期完了をPagesの
公開内容と独立して確認します。

新しい1536次元Production indexの同期とQA証跡を確認したため、Productionの
`SEARCH_ENABLED=true`を維持します。Previewは`SEARCH_ENABLED=false`かつVectorize bindingなしです。
リリース完了判定は次をすべて満たした状態です。

1. PagesのGit ProviderがYes、source repositoryが`acecore-systems/acecore-schools`、
   production branchが`main`である。
2. Productionに32 bytes以上の`SEARCH_RATE_LIMIT_SECRET`が暗号化bindingとして存在する。
3. `acecore-schools-search-maintenance`の最新deploymentがrepoのconfigと一致し、cron
   `17 * * * *`と成功したscheduled eventを確認できる。
4. GitHub push deploymentが成功し、Pages deploymentのSource SHAが有効化PRのmerge SHAと
   一致する。Direct UploadはProduction完了条件にしない。
5. `schools.acecore.net`のcustom domainがactiveで、TLSが正常である。
6. `/api/health`の`searchEnabled`が`true`で、desktop/mobileの公開UI、既知query、結果リンクを
   実ブラウザで確認する。
7. Production D1の時間集計が1件増え、リアルタイムlogに5xxやprovider errorがない。
8. `Sync Schools Vectorize index`のProduction runが成功し、artifact内のcorpusとsync log、
   公開build marker、Vectorizeのvector countが一致する。

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
HTTP 5xx、`provider_error`／`internal_error`、0件率、平均・最大latency、OpenAI input tokens、
Vectorize queried dimensions、D1 rows writtenを一緒に確認します。

## Cost guardrails

`text-embedding-3-large`は100万input tokenあたり$0.13です。`dimensions: 1536`はOpenAI側で
短縮して受け取り、Vectorizeの1536次元上限に合わせます。VectorizeはFreeで月3,000万
queried dimensions／500万stored dimensions、Paidで最初の5,000万／1,000万が含まれます。
保存量7件なら`7 vectors × 1,536 dimensions = 10,752 stored dimensions`です。

全体上限20検索/分が30日間続く仮定では、最大864,000 query、約1,327.1 million queried
dimensionsです。Paidのincluded分を超えるVectorize query費用は現行単価で約$12.77/月です。
OpenAI embedding費用は`月間input token ÷ 1,000,000 × $0.13`で、平均40 token/queryなら
約$4.49/月、平均100 token/queryなら約$11.23/月です。いずれも上限からの試算であり実績では
ありません。

client/global判定は1 statementで、許可時だけ2行をinsert/updateします。global上限後に新しいIPを
送ってもclient行を追加しないため、D1 rows writtenは検索上限とcleanup対象行で抑えられます。
一方、公開endpointへのHTTP requestと上限判定のD1 query自体は20回/分の外側なので、Pages
Functions requests、D1 rows read、WAFイベントも監視します。急増、D1 error、想定外の費用を
検知した場合は`SEARCH_ENABLED=false`へrollbackします。

## References

- [Vectorize introduction](https://developers.cloudflare.com/vectorize/get-started/intro/)
- [Vectorize limits](https://developers.cloudflare.com/vectorize/platform/limits/)
- [Vectorize client API](https://developers.cloudflare.com/vectorize/reference/client-api/)
- [OpenAI text-embedding-3-large](https://developers.openai.com/api/docs/models/text-embedding-3-large)
- [Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Pages Functions metrics](https://developers.cloudflare.com/pages/functions/metrics/)
- [Pages Functions logging](https://developers.cloudflare.com/pages/functions/debugging-and-logging/)
- [OpenAI API pricing](https://openai.com/api/pricing/)
- [Vectorize pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
