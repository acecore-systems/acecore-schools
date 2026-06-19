source visual reference: AG manga panel concept
implementation checks: Browser/IAB screenshot and interaction check against local Astro dev server
viewports: desktop 1536x1024, mobile 390x844
state: public landing page at local Astro dev server

**Findings**

- No actionable P0/P1/P2 findings remain.

**Comparison Notes**

- Page architecture: The implementation follows the AG comic-sheet structure: sticky top navigation, a large left hero copy panel, a right-side asymmetric five-panel manga board, 01-07 numbered information panels, and an 08 final CTA strip.
- Course separation: ロボット工作・制御 is presented as physical robot assembly, sensors, motors, and movement/control. 実践プログラミング is presented separately with laptop code, Git/API/database/cloud copy, and no robot imagery.
- Panel layout: The desktop composition now keeps the AG-style one-sheet density. The extra hero study panel and separate audience panel were removed from the desktop comic sheet, and the final CTA was renumbered from 09 to 08.
- Typography and color: Heavy black display type, true-white paper, thick black panel gutters, navy numbering, green LINE CTA, and restrained course accents match the accepted AG direction.
- Responsive behavior: Desktop keeps the comic sheet density without clipped H1 or broken pricing labels. Mobile stacks the same panels vertically and keeps CTA/buttons within the viewport.

**Verification**

- `npm run format:check` passed.
- `npm run build` passed.
- Browser/IAB desktop screenshot captured at 1536x1024.
- Browser/IAB mobile screenshot captured at 390x844 with no horizontal overflow.
- Browser/IAB verified FAQ open behavior.

**Intentional Deviations**

- The implementation uses generated production panel assets rather than the original concept screenshot as UI, so all user-facing text remains HTML and source-controlled.
- The schedule panel uses the current source schedule rows instead of inventing an availability matrix.
