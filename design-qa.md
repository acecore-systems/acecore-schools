source visual reference: generated Workshop Journey concept 3
implementation checks: desktop Chrome and mobile headless Edge
viewports: desktop Chrome 1486x802, mobile headless Edge 390x844
state: public landing page at local Astro dev server

**Findings**

- No actionable P0/P1/P2 findings remain.

**Comparison Notes**

- Fonts and typography: The implementation keeps the heavy rounded sans display treatment, strong Japanese heading weight, compact nav type, and readable body type from the Workshop Journey reference. Mobile H1 and lead copy were adjusted to wrap without clipping.
- Spacing and layout rhythm: Hero, four-step flow, comparison section, course cards, pricing, and final CTA follow the selected Workshop Journey order and open white spacing. Header was changed from fixed to top-only absolute positioning so it no longer overlaps mid-page content.
- Colors and visual tokens: Teal, coral, lime, charcoal, white base, and light teal surfaces match the selected direction. CTA colors and course accent colors remain consistent across sections.
- Image quality and asset fidelity: Hero, flow, course, and CTA images use generated classroom/workshop photography matching the hands-on robotics/coding direction. All project images loaded in Chrome after scrolling.
- Copy and content: Existing source copy is preserved for hero, learning flow, comparison, course, pricing, and CTA content. Current source state is Japanese-only, so the multilingual language strip from the early concept is intentionally omitted.

**Patches Made Since QA Started**

- Replaced the old green editorial layout with the Workshop Journey page structure and local generated image assets.
- Changed the header from fixed to absolute to avoid overlapping course and comparison sections while scrolling.
- Tightened course card title wrapping and clamped long descriptions to preserve the five-column layout.
- Fixed mobile header and hero typography: header CTA is hidden on small screens, H1 wraps to two lines, and hero lead/body copy can wrap safely.
- Added explicit wrapping for section descriptions and flow step copy so mobile text stays inside the viewport.
- Switched mobile course cards to a vertical media/text layout to avoid cramped two-column copy at 390px.

**Implementation Checklist**

- Build passes with `npm run build`.
- Format passes with `npm run format:check`.
- Desktop top, mid-page, and course/pricing regions were checked in Chrome.
- Mobile 390px screenshot was checked in headless Edge.
- Mobile 390px layout was measured in an iframe: `scrollWidth` matched `clientWidth` and no horizontal overflow offenders were found.
- CTA links resolve to `https://acecore.net/contact/` and `https://lin.ee/DjIrdqj`.

**Follow-up Polish**

- Optional: replace the code-native brand mark with an official Acecore Schools logo asset if one exists.

final result: passed
