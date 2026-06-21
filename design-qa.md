source visual reference: AG manga panel concept
implementation checks: Playwright-managed Chromium screenshot and interaction check against local Astro dev server
viewports: desktop 1536x1024, mobile 390x844
state: public landing page at local Astro dev server

**Findings**

- No actionable P0/P1/P2 findings remain.

**Comparison Notes**

- Page architecture: The implementation follows the AG comic-sheet structure: sticky top navigation, a large left hero copy panel, a right-side asymmetric five-panel manga board, 01-07 numbered information panels, and an 08 final CTA strip.
- Course separation: ロボット工作・制御 is presented as physical robot assembly, sensors, motors, and movement/control. 実践プログラミング is presented separately with laptop code, Git/API/database/cloud copy, and no robot imagery.
- Panel layout: The desktop composition keeps the AG-style one-sheet density, including the angled hero/manga boundary, a staggered right-side hero manga board, 01-03 / 04-07 row structure, and the 08 final CTA strip.
- Panel alignment: At 1536x1024, the major horizontal cuts align to the reference: hero bottom y=449, first detail row bottom y=685, second detail row bottom y=897, final CTA bottom y=1014.
- Hero board: The right hero board uses desktop-specific staggered panel placement so the robot and PC/smartphone panels extend lower than the programming panel, with the consultation panel shorter at the bottom right.
- Overflow: The hero copy, all numbered desktop panels, and the final CTA strip render with `scrollHeight <= clientHeight`; no hidden panel content remains.
- Typography and color: Heavy black display type, true-white paper, thick black panel gutters, navy numbering, green LINE CTA, and restrained course accents match the accepted AG direction.
- Responsive behavior: Desktop keeps the comic sheet density without clipped H1 or broken pricing labels. Mobile stacks the same panels vertically and keeps CTA/buttons within the viewport.

**Verification**

- `npm run format:check` passed.
- `npm run build` passed after rerunning outside the sandbox because Vite hit `spawn EPERM` inside the sandbox.
- Browser/IAB could not be used. The latest attempt failed while connecting to the in-app browser with `failed to write kernel assets: 指定されたパスが見つかりません`.
- Playwright-managed Chromium desktop screenshot captured at 1536x1024.
- Playwright-managed Chromium mobile screenshot captured at 390x844 with no horizontal overflow.
- Playwright-managed Chromium verified FAQ open behavior.

**Intentional Deviations**

- The implementation uses generated production panel assets rather than the original concept screenshot as UI, so all user-facing text remains HTML and source-controlled.
- The schedule panel uses a compact availability matrix to match the selected AG reference layout.
