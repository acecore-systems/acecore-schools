# Acecore Schools purpose-city redesign QA

## Comparison source

- Selected rough: `artifacts/design-qa/selected-reference.webp`
- Combined comparison: `artifacts/design-qa/reference-vs-implementation.webp`
- Desktop section contact sheet: `artifacts/design-qa/desktop-contact.webp`
- Mobile section contact sheet: `artifacts/design-qa/mobile-contact.webp`
- Browser: Codex in-app browser
- Viewports: 1440×1000, 820×1000, 390×844, 320×800

## Final findings

No actionable P0, P1, or P2 findings remain.

## Comparison notes

- Typography: the implementation keeps the reference's editorial Japanese serif headings and compact sans-serif utility text. The vertical desktop hero headline switches to a horizontal headline below 700px.
- Layout and spacing: the city hero, four crisp purpose entrances, individual-support spread, four learning fields, process, support system, outcomes, current/past facts, consultation, and FAQ preserve the selected rough's hierarchy without the rejected route-map treatment.
- Colors and surfaces: off-white, deep navy, cool pale blue, and a restrained green accent are used consistently. Cards rely on straight borders and spacing instead of generic rounded-card decoration.
- Imagery: all 11 generated WebP assets loaded successfully. The photos distinguish high-school-equivalency study, programming, practical device use, and robotics/making. Robotics is not presented as programming.
- Copy: the founder story is absent from the homepage. The four fields are described as individually assembled learning areas rather than fixed current courses. The current online format appears once in the factual lower-page section, while the summer in-person robot workshop is explicitly identified as a past activity that is not currently running.
- Icons: Phosphor Icons supplies a single consistent outline family; no custom inline SVG or CSS-drawn substitute is used.
- Responsive behavior: desktop, tablet, standard mobile, and 320px layouts have no horizontal document overflow. The mobile hero headline was resized and moved into the open sky so it no longer clips or crosses the subject's eyes, and the outcomes heading uses a balanced intentional break.

## Interaction and accessibility checks

- Mobile navigation opens, announces `aria-expanded="true"`, changes its accessible name to `メニューを閉じる`, and closes again.
- FAQ disclosure opens and exposes its answer; the plus icon changes state.
- Purpose, section-navigation, consultation, About, privacy, and LINE links have valid destinations.
- All 11 built images have non-empty alternative text.
- Focus-visible styles and reduced-motion overrides are present.
- Browser console: no warnings or errors during final desktop/mobile checks.

## Verification

- `npm run format:check`
- `npm run build`
- Image-alt audit: 2 HTML files, 11 images, 0 failures
- `git diff --check`

final result: passed
