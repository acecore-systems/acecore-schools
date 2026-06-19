source visual reference: AG manga panel concept
implementation checks: Browser/IAB interaction check, Playwright Chromium screenshots against Astro preview
viewports: desktop 1536x1024, mobile 390x844
state: public landing page at local Astro preview server

**Findings**

- No actionable P0/P1/P2 findings remain.

**Comparison Notes**

- Page architecture: The implementation follows the AG comic-sheet structure: sticky top navigation, a large left hero copy panel, a right-side asymmetric manga panel board, numbered service panels, pricing, FAQ, audience block, and final LINE CTA.
- Course separation: ロボット工作・制御 is presented as physical robot assembly, sensors, motors, and movement/control. 実践プログラミング is presented separately with laptop code, Git/API/database/cloud copy, and no robot imagery.
- Audience fit: The page no longer reads child-only. It explicitly includes 高校生, 保護者, 社会人・大人の学び直し, シニア・PC/スマホ初心者, and 高卒認定 learners.
- Typography and color: Heavy black display type, true-white paper, thick black panel gutters, navy numbering, green LINE CTA, and restrained course accents match the accepted AG direction.
- Responsive behavior: Desktop keeps the comic sheet density without clipped H1 or broken pricing labels. Mobile stacks the same panels vertically and keeps CTA/buttons within the viewport.

**Verification**

- `npm run format:check` passed.
- `npm run build` passed.
- Browser/IAB verified FAQ open behavior and CTA link targets.
- Playwright Chromium screenshots were captured from Astro preview for desktop, mobile, and full-page checks. Temporary screenshot files were removed after visual inspection.

**Intentional Deviations**

- The implementation uses generated production panel assets rather than the original concept screenshot as UI, so all user-facing text remains HTML and source-controlled.
- The schedule panel uses the current source schedule rows instead of inventing an availability matrix.
