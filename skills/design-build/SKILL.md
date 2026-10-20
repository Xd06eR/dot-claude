---
name: design-build
description: Turn an approved design direction into production markup. Use when a settled direction (mockup image, written plan, DESIGN.md, or an agreed direction in conversation) needs to become real UI. Returns semantic, responsive, accessible markup matched to the repo's framework.
origin: gstack + impeccable
---

Turn an approved design direction into production-quality front-end code. Read the direction (an approved mockup image, a written plan, or a description in the conversation), detect what the repo is built with, and generate semantic, responsive, accessible markup with real content.

Then preview it and refine against the direction.

**Framework fit (core rule):** the output matches the repo, not a fixed stack. A static site gets self-contained HTML plus CSS. A React, Next, Vue, Svelte, Solid, or Astro project gets a component in that framework's idiom.

Detect it (Step 2). If genuinely ambiguous, ask in plain text. Never impose a framework, and never add a runtime dependency the repo does not already use without asking first.

Run straight through. Stop only for a real fork in output format you cannot infer, or a design decision the direction does not settle.

## Step 1: Identify the starting point

Establish what you are building from. One of three modes:

- **Reference:** an approved mockup or screenshot exists. Read it with the Read tool (it renders images) and treat it as the source of truth to match.
- **Plan:** a written spec, PRD, or plan describes the UI. Read it and build the spec from its prose.
- **Freeform:** only a description in the conversation. Ask, in plain text, for the missing essentials: purpose and audience, visual feel (light/dark, dense/spacious, serious/playful), and the content sections (hero, features, pricing, and so on). Do not proceed on guesses for these.

If a `DESIGN.md` (or equivalent design-tokens file) exists in the repo, read it; `design-consultation` is the usual upstream source. Its tokens (brand colors, fonts, spacing scale) are authoritative and override anything inferred from a mockup.

Settle two things before generating: a short **screen name** (for example `landing`, `dashboard`, `pricing`) and the **output path inside the repo**. Default to a sensible in-repo location (a static file goes in a `previews/` or `design/` directory; a component goes alongside the repo's other components) and state the path you chose. Never write outside the working repo.

## Step 2: Detect the framework

First match wins:

```bash
if [ -f package.json ]; then
  grep -oE '"(next|react|vue|svelte|solid-js|@angular/core|preact|astro)"' package.json | head -1
else
  echo "none (plain HTML/CSS)"
fi
```

Map the detected framework to its component idiom: JSX/TSX for React, Next, Preact, or Solid; a single-file component for Vue; a `.svelte` file; a `.astro` file; a component plus template for Angular.

None detected: a self-contained `.html` file with a `<style>` block.

- For a component target, match the repo's existing conventions: TypeScript vs JavaScript (check the extensions in use), styling approach (CSS modules, Tailwind, styled-components, plain CSS), and file layout. Read one or two neighboring components first.
- If the repo mixes frameworks or the target is unclear, ask in one plain-text question which to emit. Otherwise state the detected format and continue.

## Step 3: Build the implementation spec

From the reference, plan, or description, extract and write down a compact spec:

- **Colors:** exact hex values, named by role (background, surface, text, primary, accent, border).
- **Typography:** font families and weights, plus the type scale (sizes for headings, body, small text).
- **Spacing:** the spacing scale in use (a consistent step, commonly 4px or 8px based).
- **Components:** the list of blocks to build (header, nav, hero, cards, footer, and so on).
- **Layout:** the overall structure (single column, sidebar, grid) and how it changes across breakpoints.

Prefer values that `DESIGN.md` defines. Output the spec as a short summary before writing any code, so the plan is visible and correctable.

## Step 4: Generate the markup

Write the file to the Step 1 path. Build to this quality bar:

- **Design tokens as CSS custom properties** (`--color-*`, `--space-*`, `--font-*`), from the spec and DESIGN.md. One source of truth, no scattered literals.
- **Semantic HTML5:** `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`. Correct heading hierarchy (one `<h1>`, no skipped levels).
- **Responsive by default:** a fluid layout that holds at 375, 768, 1024, and 1440px. Use intrinsic sizing (grid `auto-fit` with `minmax`, `fit-content`, flexbox) and container queries where a component's layout depends on its own width, not just the viewport. Adaptation rethinks the experience for each context; it is not scaling pixels.
- **Accessibility basics:** meaningful `alt` text, labeled form controls, ARIA only where native semantics fall short, visible `:focus-visible` states, and color contrast meeting WCAG AA.
- **Dark mode** via `prefers-color-scheme`, driven by the token variables.
- **Reduced motion:** gate any animation behind `prefers-reduced-motion: no-preference`.
- **Real content** from the reference or plan. Never lorem ipsum, never "Your text here". Controls name their action with a specific verb plus object (never Yes/No/OK/Submit); destructive actions name the object and the consequence, with undo preferred over confirmation; errors answer what failed, why when known, and how to recover; loading text never invents progress; placeholders are examples, not labels; link text makes sense out of context; each idea is said once.
- Optional: `contenteditable` on headline and copy blocks so the user can tweak wording live in the preview (native reflow, no JS required).

**Commitment checks:**

- **Commit every atom:** nav, buttons, inputs, and links are rebuilt in the direction's vocabulary; a stock component inside a committed form is a lapse. Land the first build fully committed; later passes make it clear and effective, never dilute it. When the direction names a technique (canvas, view transitions, generative motion), build the technique itself, not a static imitation.
- **The first viewport is a thesis, not a header:** demonstrate the mechanism immediately, at the scale it has in life. The memory test: if someone left after one viewport, what would they describe an hour later? If the honest answer is a mood, the concept has not committed.
- **Prove, don't claim:** show the subject doing its job; demonstration data is design material, authored at full fidelity and labeled synthetic, while commercial claims (prices, customer counts, benchmarks) stay uninventable.
- **Author the assets, never substitute chrome:** gradients, glass, generic icon tiles, or many-vertex clip-paths standing in for an authored asset are the gap wearing chrome.
- **Pace the scroll like a studio:** vary density, scale, and quiet inside one grammar; a dense passage earns a quiet one, and the page ends anchored by a real close.

**Layout without a JS engine.** Modern CSS covers what a text-layout library used to. Text reflows on its own.

`text-wrap: balance` tightens headings and `pretty` improves body copy; `fit-content` shrinkwraps chat-style bubbles; `shape-outside` flows text around obstacles; container queries handle self-sizing components.

Reach for a JS measurement library only if a specific effect genuinely needs it, and never add one silently.

**AI-slop blacklist (the category's defaults, not bans: the direction's own words can earn any of them back; when one slips through anyway, rewrite the element, never soften it):**

- Purple or blue gradients as a default
- Cream-and-serif as the default palette
- Gradient text
- Generic three-column feature grids
- Identical card grids, or cards nested inside cards
- Eyebrow chips, kickers, or icon tiles above headings (the one absolute ban: no direction earns it back; the heading carries its own weight)
- Hero metric rows ("10k+ users") or stats bands
- Sparklines, progress rings, or rounded-card-plus-drop-shadow standing in for content
- Center-everything layouts with no hierarchy
- Decorative blobs, waves, geometric filler, or stripes and grid-paper backgrounds with no real canvas under them
- Glow edges, radial halos, or pulsing status dots
- Glass or blur as decoration rather than a specific effect
- Hard offset shadows (`box-shadow: 4px 4px 0`) outside a genuinely neobrutalist direction
- Colored side-stripe borders above 1px on cards, list items, callouts, or alerts
- Uniform bubbly border-radius on everything
- `system-ui` as the primary font, or a system display face as the display voice of an own-world page (source and self-host a face; the closest installed font is a failure, not a fallback)
- Monospace as a "technical" costume rather than for code, data, or measurement
- Section numbers (01 / 02 / 03) unless the sequence itself carries information
- Modals by reflex, for tasks needing neither interruption nor protected focus
- Light or dark picked by category instead of the use scene
- Geometric masks approximating organic contours (derive an alpha matte from the actual image, or author a cut-out)
- Sketch-style SVG scenes imitating illustration; real illustration or none (SVG doing geometry: diagrams, crisp vector shapes, animated linework, stays first-class)
- Stock-photo placeholder boxes
- Logo-marquee "trusted by" strips
- Generic hero copy ("Welcome to X", "Unlock the power of...")
- Generic "Get Started" / "Learn More" CTAs
- Emoji or unicode glyphs standing in for an icon system (icons are drawn: a real library or authored SVG, one consistent stroke and weight)
- Boilerplate testimonial sections
- The left-text, right-image hero cliché

## Step 5: Preview

Give the user a way to see it:

- **Self-contained HTML:** open the file with a portable opener chain: `open "$FILE" || xdg-open "$FILE" || start "$FILE" || echo "Open in your browser: $FILE"`. If it uses ES modules or fetches, serve the directory instead with `PY=$(command -v python3 || command -v python); "$PY" -m http.server 8000 --bind 127.0.0.1` (Windows Git Bash has `python`, not `python3`) and share `http://localhost:8000/<file>` (change the port if 8000 is taken).
- **Framework component:** render it in the repo's own dev server (`npm run dev` or the project's script) on a throwaway route.

Where a browser automation capability is available (a Playwright or Chrome DevTools MCP, for example), screenshot the page at 375, 768, and 1440px and read the images back to check for text overflow, layout collapse, and broken responsiveness. Fix issues before handing it over.

Verify the render against the floor in the same batched look, not as separate screenshot trips:

- **Contrast:** body and placeholder text at least 4.5:1, large text at least 3:1; secondary text on colored surfaces tinted from that hue, never gray.
- **Depth:** shadows carry an offset plus soft blur; a zero-offset colored halo is decoration.
- **Spacing:** tight groups, generous separation, more space above a heading than below it (read the computed values).
- **Type:** body measure 65-75ch, display max 6rem, tracking floor -0.04em; run the real copy at every breakpoint and fix what overflows.
- **States:** hover, disabled, loading, error, empty, and keyboard focus all present.
- **Browser surfaces:** text selection, caret, scrollbars, focus rings, and underline offset themed from the palette; the parts you did not draw still ship with browser defaults that belong to no design system.
- **Copy:** controls name their action; errors name the problem and the recovery.
- **Coverage:** every brief requirement present and findable within seconds.

Before comparing against the direction, inventory the render's salient elements in your own words; a review anchored on the plan inherits whatever the plan dropped. Then judge three axes that never lapse: TYPE (the lettering's character, weight, and contrast against the chosen faces; a face of a different character is a miss however the layout matches), MATERIAL (flat CSS or clean vector standing in for textured, dimensional, or photographic material is a miss regardless of placement; faked physicality such as CSS bevels and embossing is the most reliable mark of machine-made design), and GROUND (the page field's value and temperature; drift toward warm cream on light grounds or blue-black slate on dark is the rendition prior, so hunt it).

**Capture validity:** settle or disable entrance motion before capturing (an element hidden by animation timing reads as missing and gets fixed into a regression), capture full-page from the document top, and open every capture once to confirm it shows what its name claims. A check run against a malformed capture binds nothing: recapture first, never review around it. Self-check rounds cap at two, fixes batched between them; deeper iteration belongs to the Step 6 loop with the user. Report the result at its actual scope: a build with open material findings is never announced as done.

Where no such capability exists, say so and rely on the user's browser.

## Step 6: Refinement loop

1. Show the reference alongside the live page when one exists.
2. Ask, in plain text: "What should change? Say 'done' when it's right."
3. On "done", "ship it", or "looks good", exit to Step 7.
4. Otherwise apply the feedback with **surgical Edit changes** to the file, not a full rewrite (the user may have made live `contenteditable` tweaks worth keeping). Summarize the change in a line or two, re-screenshot if that capability is available, and loop.

Verify fixes against fresh captures, never against your own narration of what changed: a claimed fix you cannot see in the recapture is unresolved. Each re-check scores the listed fixes (resolved / partial / unresolved) rather than opening a new defect hunt. Calibrate against the direction and the floor, never against the effort visible in the build.

After about ten rounds without "done", ask once, in plain text, whether to keep iterating or call it.

Once the build is called done, polish with `make-interfaces-feel-better` and verify behavior with `qa`.

## Step 7: Extract design tokens (optional)

If no `DESIGN.md` exists, offer once, in plain text, to write one from the tokens you just used (colors, fonts, spacing, radii, shadows). If the user agrees, write `DESIGN.md` to the repo root so later design work stays consistent.

Skip silently if one already exists or the user declines.

## Operate surfaces: earned familiarity

When the target surface is an Operate surface (app UI, dashboards, settings, data tables, tools: anywhere the user is in a task), product rules override brand-surface instincts. The bar is earned familiarity: a category-fluent user should trust the interface immediately, and the failure mode is not flatness but strangeness without purpose. The tool should disappear into the task.

- **Typography:** one well-tuned family is often right; product UI does not need a display/body pairing. Use a fixed rem scale, not fluid clamp headings, and a tighter ratio (1.125-1.2 between steps). Prose measure still applies (65-75ch); data and compact UI can run denser, and tables at 120ch+ are fine.
- **Color:** Restrained is the floor. Standardize a state-rich semantic vocabulary (hover, focus, active, disabled, selected, loading, error, warning, success, info); spend accent color on primary actions, current selection, and state indicators only, never decoration; a second neutral layer carries sidebars, toolbars, and panels.
- **Components:** every interactive component ships default, hover, focus, active, disabled, loading, and error states. Skeletons for loading, not spinners in the middle of content; empty states that teach the interface, not "nothing here". Keep affordances consistent across the surface, and let overlays escape their container (`<dialog>`, the popover API, `position: fixed`, or a portal; an absolutely positioned dropdown inside an `overflow: hidden` ancestor gets clipped).
- **Motion:** 150-250ms on most transitions, conveying state only (state change, feedback, loading, reveal). No orchestrated page-load sequences.
- **Bans on Operate surfaces:** decorative motion, inconsistent component vocabulary across screens, display fonts in UI labels or data, reinvented standard affordances (custom scrollbars, non-standard modals), heavy color on inactive states, and modals as first thought (exhaust inline and progressive alternatives first).
- **Permissions:** density is allowed; standard navigation patterns (top bar plus side nav, breadcrumbs, tabs, command palettes) are virtues; consistency over surprise, with delight saved for moments, not pages. System fonts and familiar sans defaults are legitimate here; the font blacklist's system-ui and display-voice items do not bind Operate body and UI text.

## Usability guardrails

Krug's rules, applied while building, not just while designing:

- **Don't make the user think.** Every screen should be self-evident; if a control needs explanation, redesign it.
- **Users scan, they don't read.** Strong visual hierarchy, clear grouping, short labels. Prominence tracks importance.
- **Make clickable things obviously clickable** without relying on hover; mobile has no hover.
- **Use conventions:** logo top-left, nav where expected, magnifier means search. Innovate on navigation only with a reason.
- **Cut noise:** remove words, remove clutter, remove anything shouting for attention that should not.
- **Touch targets at least 44px**, and clarity beats consistency when the two conflict.

## Important rules

- **Fidelity to the direction over code elegance.** When a mockup exists, match it: a hard-coded `width: 312px` that matches beats a clever grid that does not. In plan or freeform mode, the user's refinement feedback is the source of truth.
- **Framework-appropriate output.** Match the repo's stack, conventions, and styling approach. Add no new runtime dependency without asking first.
- **Real content only.** Extract from the mockup, draw from the plan, or generate realistic copy from the description. No placeholder filler.
- **Surgical edits in refinement.** Edit the file in place; do not regenerate it and lose the user's live tweaks.
- **Stay inside the working repo.** Write only the output file and an optional `DESIGN.md`. No state, metrics, or files elsewhere.
- **One page per invocation.** For a multi-page design, run the skill once per page.
- **No strategy text in shipped artifacts.** Direction contracts, briefs, and design reasoning never leak into implementation source or browser-delivered output: no HTML or JSX comments, hidden DOM, `data-*` attributes, serialized props, RSC payloads, or JSON-LD carrying them.
