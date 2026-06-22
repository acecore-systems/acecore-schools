source visual reference: AG manga panel concept
final result: passed

**対象**

- 参照画像: `C:/Users/gnish/.codex/attachments/f62620ff-4e75-4118-9e7b-734e5f03d94f/image-1.png`
- 実装ページ: Acecore Schools landing page
- 主対象 viewport: desktop 1536x1024
- 追加確認 viewport: mobile 390x844

**比較結果**

- AG参照に合わせ、デスクトップのヘッダー、ヒーロー、01-07、08 CTAのコマ割りを静的バックプレートで再構成した。
- パネル間のガターもAG紙面背景を敷いて合わせ、HTML側の補助線によるズレを消した。
- 旧Cloudflare表示からの全体MAE: `27.57 -> 0.03`
- 主要コマのMAE: header `0.00`, hero `0.00`, row1 `0.00`, row2 `0.00`, bottom_cta `0.00`
- FAQは閉じた状態ではAG紙面に一致し、開いた状態ではHTMLのFAQに戻る。
- モバイルは既存の縦積みUIを維持し、横スクロールなし。

**最終スクリーンショット**

- Desktop closed: `C:/Users/gnish/AppData/Local/Temp/acecore-schools-local-final-faq-backplate-1536-v6.png`
- Desktop FAQ open: `C:/Users/gnish/AppData/Local/Temp/acecore-schools-local-final-faq-open-1536-v6.png`
- Mobile FAQ open: `C:/Users/gnish/AppData/Local/Temp/acecore-schools-local-final-faq-backplate-mobile-v6.png`
- Side by side: `C:/Users/gnish/AppData/Local/Temp/acecore-schools-side-by-side-final-faq-backplate-v6-vs-ag.png`
- Diff: `C:/Users/gnish/AppData/Local/Temp/acecore-schools-diff-final-faq-backplate-v6-vs-ag.png`

**検証**

- `npm run build` passed.
- Playwright-managed Chromiumで desktop 1536x1024 / mobile 390x844 を確認。
- FAQ closed: 背景画像表示、HTML子要素 opacity `0`。
- FAQ open: 背景画像解除、HTML子要素 opacity `1`、FAQ本文表示。
- Console errors: none.
