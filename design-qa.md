source visual reference: AG manga panel concept
implementation checks: Playwright-managed Chromium screenshot and interaction check against local Astro dev server
viewports: desktop 1536x1024, mobile 390x1200
state: public landing page at local Astro dev server and production preview

**Findings**

- No actionable P0/P1/P2 findings remain.

**Comparison Notes**

- Page architecture: The implementation follows the AG comic-sheet structure: sticky top navigation, a large left hero copy panel, a right-side asymmetric five-panel manga board, 01-07 numbered information panels, and an 08 final CTA strip.
- Course separation: ロボット工作・制御 is presented as physical robot assembly, sensors, motors, and movement/control. 実践プログラミング is presented separately with laptop code, Git/API/database/cloud copy, and no robot imagery.
- Panel layout: The desktop composition keeps the AG-style one-sheet density, including the angled hero/manga boundary, a staggered right-side hero manga board, 01-03 / 04-07 row structure, and the 08 final CTA strip.
- Panel alignment: At 1536x1024, the major horizontal cuts align to the reference: hero bottom y=449, first detail row top/bottom y=459/685, second detail row top/bottom y=693/897, final CTA top/bottom y=904/1014.
- Hero board: The desktop right hero board now uses a reference-aligned manga crop from the accepted AG screenshot, so the staggered programming/robot/PC/GED/consultation panel cuts and in-panel artwork match the target much more closely.
- Paper inset: The comic sheet now uses a white paper gutter with black panel lines instead of broad black filled bands, placing the desktop panel field at x=10..1526 and matching the target's outer/inner border structure.
- Hero caption fidelity: The hero manga captions now use the reference-style short white text boxes, hide the extra course-category label in the top panels, remove the drop shadow, and preserve deliberate line breaks.
- Hero panel widths: The robot panel is widened and the PC/smartphone panel is narrowed so the upper-right manga cuts match the reference proportions more closely.
- Hero boundary: The left hero copy panel now extends into a white diagonal wedge with a black slanted gutter, matching the reference's stronger manga cut between the copy panel and the right image board.
- Primary row cuts: The 01/02/03 row uses fixed reference-aligned cuts at x=10, 336, 346, 826, and 836 on the 1536px desktop canvas.
- Hero title: The desktop H1 horizontal scale now matches the AG reference more closely; the H1 comparison area improved from MAE 54.15 to 26.48 against the reference crop.
- Trial panel: The 01 free-trial consultation image now uses the AG clipboard/consultation crop, removes the extra photo-card border, and sits at x=139/y=460/w=195/h=217 so the plant/clipboard artwork begins at the same top cut and reaches the right panel edge more like the AG reference while keeping the left checklist and duration note readable.
- Trial checklist: The 01 checklist markers now render as red outlined check boxes rather than plain check marks, matching the reference detail.
- Course cards: The 03 course-card image crops now come from the AG reference, while the course titles and explanatory copy remain HTML.
- Secondary row cuts: The 04/05/06/07 row now uses reference-aligned desktop cuts at x=10, 488, 498, 856, 866, 1146, and 1156, with the same wider comic gutter rhythm as the AG concept.
- Final CTA strip: The final image strip uses the AG reference crop at its native 563px desktop width, and the LINE CTA overlaps it with a diagonal green cut instead of a vertical divider.
- Overflow: The hero copy, all numbered desktop panels, and the final CTA strip render with `scrollHeight <= clientHeight`; no hidden panel content remains.
- Typography and color: Heavy black display type, true-white paper, thick black panel gutters, navy numbering, green LINE CTA, and restrained course accents match the accepted AG direction.
- Responsive behavior: Desktop keeps the comic sheet density without clipped H1 or broken pricing labels. Mobile stacks the same panels vertically and keeps CTA/buttons within the viewport.

**Verification**

- `npm run format:check` passed.
- `npm run build` passed after rerunning outside the sandbox because Vite hit `spawn EPERM` inside the sandbox.
- Browser/IAB connected successfully for the Cloudflare preview. Use `load` for the wait state because this Browser runtime does not support `networkidle`.
- Playwright-managed Chromium desktop screenshot captured at 1536x1024.
- Latest desktop fidelity screenshot: `C:/Users/gnish/AppData/Local/Temp/acecore-schools-h1-trial-wide-1536.png`.
- Latest side-by-side comparison: `C:/Users/gnish/AppData/Local/Temp/acecore-schools-h1-trial-wide-side-by-side.png`.
- Latest production preview desktop screenshot: `C:/Users/gnish/AppData/Local/Temp/acecore-schools-preview-h1-trial-wide-1536.png`.
- Playwright-managed Chromium mobile screenshot captured at 390x1200 with no horizontal overflow.
- Latest mobile FAQ screenshot: `C:/Users/gnish/AppData/Local/Temp/acecore-schools-h1-trial-mobile.png`.
- Latest production preview mobile FAQ screenshot: `C:/Users/gnish/AppData/Local/Temp/acecore-schools-preview-h1-trial-wide-mobile.png`.
- Playwright-managed Chromium verified FAQ open behavior.

**Intentional Deviations**

- The implementation uses cropped AG reference artwork only for manga/image areas. Navigation, hero copy, CTA labels, numbered panel titles, course copy, pricing, FAQ, and other user-facing UI text remain HTML and source-controlled.
- The schedule panel uses a compact availability matrix to match the selected AG reference layout.
