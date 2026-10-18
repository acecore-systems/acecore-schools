# Acecore Schools purpose-city redesign QA

## 今回の監査範囲

- `origin/main` の旧 Schools 情報と現行トップページを比較
- 現行 `https://acecore.net/` とローカル `acecore-net` のブランド・導線・問い合わせ仕様を照合
- Codex in-app browser で 1440×1000 / 390×844 を実測
- PC・モバイルの余白、情報密度、横はみ出し、メニュー、FAQ を確認

## Visual evidence

- Before / after: `artifacts/quality-audit-2/comparison-before-after.webp`
- Final desktop contact sheet: `artifacts/quality-audit-2/final-desktop-contact.webp`
- Final mobile contact sheet: `artifacts/quality-audit-2/final-mobile-contact.webp`
- Acecore reference capture: `artifacts/quality-audit-2/09-acecore-net-home.png`
- フッターロゴと料金復元の最終追補は、最新branch previewで別途確認

## 旧サイト情報の扱い

### 現行方針に合わせて復元

- 4領域ごとの具体例
  - 高卒認定: 必要科目、過去問・模試、逆算した計画、その先の選択
  - IT・プログラミング: HTML/CSS/JavaScript、Python/Node.js、DB/API/クラウド、Git・公開
  - PC・スマホ: 基本操作、Office、メール/SNS/オンライン会議、セキュリティ・トラブル対応
  - ロボット／メイキング: 機構、回路、制御、実施方法・時期
- 学生、社会人、シニアまでを対象に、年齢ではなく目的と現在地から組み立てること
- 高卒認定以外の学校学習・試験対策を相談できること
- 受講前に内容、進め方・頻度、機器・教材、費用を確認できること
- Acecore.netの現行料金ページと照合した、入会金・月謝・教材／管理費の税込目安
- LINEに加え、AcecoreのSchools専用問い合わせフォーム

### 現行性を確認できないため復元しない

- 旧曜日・時間帯・固定頻度
- 無料体験授業、端末貸出
- 会員ポータル、予約変更、ICSなど未提供の将来機能
- 子供向けロボットプログラミングを常設コースとして扱う旧表現

## Acecore連携

- ヘッダーを公式ロゴ付きの `Acecore / Schools` 階層へ変更
- `Acecore Schoolsについて` という誤った親リンク名を `運営元 Acecoreについて` へ修正
- Acecoreのサービス・About・Blogへ戻れる関連帯を追加
- 問い合わせフォームを `category=service&service=education` でSchools選択済みの状態へ接続
- フッターを Schools / Acecore / Network の3群へ再編
- 存在しない `/privacy-policy/` を正規の `/privacy/` へ修正
- JSON-LDの `knowsAbout` に4領域と具体例を反映

## 余白・密度

- 本文幅を1360pxから1200pxへ絞り、左右の余白を安定化
- 全セクション一律96pxをやめ、役割に応じて64〜88pxへ調整
- ヒーロー最大高を760pxから680pxへ短縮し、1440×1000で目的カードまで表示
- 成果画像に `height: auto` を追加
  - 修正前: PCで約310×1024px
  - 修正後: 約287×185px
  - 成果セクション高: 約1474pxから約622px
- 4領域を4列の薄いカードから2列の詳細カードへ変更
- サポート体制を4列から2列×2行の横組みに変更
- 相談セクションを見出し・CTAと、開始手順・事前確認事項の2列へ再編
- モバイルでは主要セクションを56〜64pxへ圧縮し、CTAを手順より前に表示

## Interaction and accessibility

- モバイルメニューは開閉でき、`aria-expanded` と accessible name が更新される
- 料金FAQを開くと回答が表示される
- 390×844で横方向のdocument overflowなし
- Acecoreロゴ3点は読込成功、全14画像にnon-empty altあり
- LINE、Schools専用問い合わせ、Acecore、Privacyのリンク先を確認
- ブラウザコンソールに warning / error なし

## Verification

- `npm run format:check`
- `npm run build`
- Image-alt audit: 2 HTML files、14 images、0 failures
- `git diff --check`

final result: passed
