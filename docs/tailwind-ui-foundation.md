# Tailwind CSS v4 UI 基盤

## 対象範囲

Issue #47 では、公開される Astro の UI を単一の Tailwind CSS v4 エントリへ集約した。Astro コンポーネントに scoped/global style block は残さず、Tailwind と並行して読み込むプロジェクト独自の旧スタイルシートも残さない。

Pagefind とアイコンの上流生成アセットは、検索・アイコン表示の機能契約として必要な第三者アセットであり、プロジェクトの UI 基盤とは別に扱う。Pagefind の見た目は同じ Tailwind エントリ内の site-search ルールで補完する。

## ビルド統合

- tailwindcss と @tailwindcss/vite を開発依存に追加する。
- Astro は astro.config.mjs で公式 Vite プラグインを読み込む。
- src/styles/tailwind.css が Tailwind を import するため、ローカル、CI、Cloudflare Pages のすべてで同じ CSS パイプラインになる。
- 設定は CSS-first とし、トークンは @theme に定義する。JavaScript の Tailwind 設定ファイルは不要。

## トークン規約

- --color-*：キャンバス、文字、ブランド、境界、状態の色
- --font-*：日本語 Sans/Serif 書体
- --shadow-*：カードの奥行きとキーボードフォーカス
- --radius-* / --spacing-*：コントロール形状とフォームの余白
- --ease-*：操作時のモーション

## Preflight の判断

Tailwind の import により Preflight を明示的に有効化する。文書余白、書体、メディア、フォーム、フォーカスリング、reduced motion の既存 UI 契約は同じ Tailwind エントリの cascade layer に記述する。これにより恒常的な Tailwind/旧 CSS 分離を作らず、アクセシブルな見た目を保つ。

## レビュー確認項目

- build と既存監査が通る。
- デスクトップ／モバイルで情報設計と主要 CTA 導線を保つ。
- キーボードフォーカス、メニュー、FAQ、検索、AI 案内の状態表現を保つ。
- prefers-reduced-motion を保つ。
