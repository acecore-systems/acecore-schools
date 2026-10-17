# Acecore Schools 目的別導線改善 QA

確認日: 2026-10-18。ローカルの最終ビルド済みプレビューで受入確認済み。基点は公開版 `7c942260abcb99cd116a814b0c8ff6e678d702e7`。

## 結果

**passed**。既存の縦書き・明朝・紺と緑の配色・画像を保ち、トップの具体情報、4領域の説明、料金の理解、相談の文脈を改善した。今回の参考・採否・情報保全は[調査記録](docs/design/purpose-led-improvements/research.md)を参照。過去のQAは[変更前記録](docs/design/purpose-led-improvements/qa-before.md)に保存した。

## 実画面と操作

親担当がBrowser plugin（Edge拡張）で320 / 390 / 768 / 1440pxを確認した。

- トップ、学習内容、料金、相談の余白・密度と画像表示を確認。対象画面に横はみ出しなし。
- 320pxのhero CTAは1列・高さ44px、390pxは2列で自然に読める。1440pxのheroとロゴの整合を確認。
- 学習領域CTAから該当分野が選択され、相談準備が開く。メモ編集後に分野を変更しても編集内容を保持し、コピーには現在の分野とメモが入る。
- `area=making` の見出し・選択欄への誘導、選択欄からTabでメモへの移動を確認。不正な `area=unknown` は未定・折り畳みへ戻る。
- モバイルメニュー、AI案内の開閉、検索入口の表示を確認。AIへメッセージは送っていない。
- フッターSchools文字は白、コンソールのerror / warnは空。
- コピー失敗時のライブ通知・手動コピー欄は実装とコードで確認。ブラウザでの権限拒否試験はしていない。

証拠: [最終desktop](docs/design/purpose-led-improvements/after-home-desktop.png)、[320px](docs/design/purpose-led-improvements/after-home-320.png)、[390px](docs/design/purpose-led-improvements/after-home-390.png)、[学び方・料金要約](docs/design/purpose-led-improvements/after-home-summary.png)、[768px料金](docs/design/purpose-led-improvements/after-pricing-768.png)。[変更前トップ](docs/design/purpose-led-improvements/before-home-desktop.png)と[操作観察記録](docs/design/purpose-led-improvements/qa-observations.json)も保存した。

## 自動検証

- `npm run build`: 8 HTML、29画像のalt監査、144内部リンク、7 JSON-LD、12 cast scenesと7 footer creditsのビルド監査が成功。
- `npm run test:consultation`: 4件。分野の許可リスト、相談文の合成、分野変更時の編集内容保持、未定・複数を検証。CIにも追加。
- `npm run test:search`: 68件。
- `npm run test:structured-data`: 5件。
- `npm run test:ui-foundation`: 1件。
- Cloudflare型生成差分、Pages Functionsビルド、maintenance workerのdry-run、Functions型検査が成功。
- `npm run format:check` とAstro pluginを指定した変更コンポーネントの整形確認、`git diff --check` が成功。

既存3費目の金額・注記、16具体例、4到達イメージ、過去イベント記録をソース比較で確認した。通常オンライン・全年齢・ロボット等の実施方法や時期は要相談という境界を保持。任意相談文例が生成検索コーパスへ入らないことも確認した。[比較結果](docs/design/purpose-led-improvements/content-check.json)を参照。

## 未実施・公開境界

- LINE・外部フォームの実送信、CAPTCHA、外部受付のE2Eは未実施。フォームに分野・本文が自動入力されるとは案内していない。
- プレビューではProductionのセマンティック検索、Vectorize同期・接続は試していない。検索入口・フォールバックとAI開閉だけを確認した。
- 全ブラウザ・Safari・網羅的なアクセシビリティ監査や相談成約の計測は未実施。
- 授業回数・時間、教材管理費の周期等の未確認商条件は新たに確定していない。
- この記録はローカル受入結果。Draft PR、CI、GitHub連携プレビュー、本番反映は別の状態として確認する。今回担当の範囲ではmergeしない。
