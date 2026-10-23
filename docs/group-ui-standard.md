# グループ共通UIの適用

## 方針と保全

2026年10月23日、Acecore本体・Designs・Systemsと、白、濃紺 `#071f3e`、太いsans見出し、矩形CTA、細い罫線を共通化した。Schoolsのアクセントは `#087d62`、hoverは `#065f4b`、淡色面は `#edf8f3`。幅は1296pxを上限とし、見出し・説明・元画像を分けて配置した。色のみの置換ではなく、トップの全幅写真、学習4分野の写真と説明の行、料金、相談帯、フッターと404へ適用した。

元のHattを含む画像、Cast登録・bytes・credit・ALT、料金、提供範囲、2023年の終了済み活動、法人情報、外部リンクを変更していない。FAQ専用ページの本文見出しはsr-onlyとし、Heroとの視覚的な重複を除いた。見出しと説明文はHTML・読み上げ上に残る。相談・コピー・検索・Pagefind・AIの処理も変更していない。

全8HTMLを基点 `5345b3f` と照合し、mainの本文、リンク、画像src/ALT、id、titleが全て一致した。トップ、学べること、学び方、料金、Schoolsについて、FAQ、活動記録、404を1440px/390pxで確認した。画像はスクロールしてdecodeとnaturalWidthを待ち、Hattと元構図の保持を実見した。全16画面で横溢れ、壊れた画像、無効なページ内anchor、pageerrorは0。見出しのcomputed font-familyはNoto Sans JP。Sans800を読み込み、未使用のSerif読込は外した。

## 検証

- `npm run build`：成功。Cast検証とテスト、出力画像・AI・リンク・構造化データ監査、Pagefind、corpus、build markerを含む。
- `node --test tests/tailwind-ui-foundation.test.mjs tests/ai-chat-ui.test.mjs tests/consultation-context.test.mjs tests/structured-data.test.mjs`：14件成功。
- `node node_modules/prettier/bin/prettier.cjs src/styles/tailwind.css src/pages/404.astro src/components/SchoolsPage.astro docs/group-ui-standard.md --semi --single-quote false --check`：変更対象の整形確認。
- `git diff --check`：成功。
- 外部QAの `group-html-preservation.mjs`：8HTML差分0。
- 外部QAの `group-schools-qa.mjs` / `group-schools-interactions.mjs`：全ページ表示、390×667のmenu/Escape/focus/resize、AI復帰、FAQ、相談query・編集保持・コピーを確認。

相談帯の小文字・番号・補足は不透明白へ揃え、computedで確認した。白と緑のcontrastは5.10:1。サイト全体のWCAG適合認定を意味しない。

## 環境と境界

Browser/IABが利用不能のため、Playwright管理Chromiumを使用した。通常Edgeや既存profileは使用していない。検索とAIはUI確認用モック応答、clipboardもモックであり、実APIへの送信やLINE・フォームの送信は未実施。既存検索安全化はport付きoriginを拒否するため、検索操作だけはportなしlocalhostへローカルresource routingして検証した。安全化処理は変更していない。

この専用worktreeは別repoの下にあるため、親PostCSS設定の探索をworktree外の一時設定で止めた。また親Prettier設定のsemi/quoteを明示上書きした。初回の全体format確認は、親から追加されたAstro parserで既存2ファイルの整形差分を検出した。無関係なファイルは変更していない。CSS quote変更が既存pipelineテストと衝突した初回失敗は、元のdouble quoteへ戻して14件成功を確認した。最終CIは独立checkoutで確認する。

証拠はタスクのvisualizations内 `group-schools/after/`、`schools-html-comparison.json`、`schools-build.log`。プレビューはGitHub連携のPR Previewのみとし、本番へのmerge/deployは行わない。
