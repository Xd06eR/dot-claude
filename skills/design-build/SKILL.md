---
name: design-build
description: Build phase for turning an approved design direction into production markup. Use when a mockup image, a written plan, or a description needs to become real UI. Returns semantic, responsive, accessible HTML/CSS matched to the repo's framework, with design tokens, dark mode, and real content.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
origin: gstack
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
- **Responsive by default:** a fluid layout that holds at 375, 768, 1024, and 1440px. Use intrinsic sizing (grid `auto-fit` with `minmax`, `fit-content`, flexbox) and container queries where a component's layout depends on its own width, not just the viewport.
- **Accessibility basics:** meaningful `alt` text, labeled form controls, ARIA only where native semantics fall short, visible `:focus-visible` states, and color contrast meeting WCAG AA.
- **Dark mode** via `prefers-color-scheme`, driven by the token variables.
- **Reduced motion:** gate any animation behind `prefers-reduced-motion: no-preference`.
- **Real content** from the reference or plan. Never lorem ipsum, never "Your text here".
- Optional: `contenteditable` on headline and copy blocks so the user can tweak wording live in the preview (native reflow, no JS required).

**Layout without a JS engine.** Modern CSS covers what a text-layout library used to. Text reflows on its own.

`text-wrap: balance` tightens headings and `pretty` improves body copy; `fit-content` shrinkwraps chat-style bubbles; `shape-outside` flows text around obstacles; container queries handle self-sizing components.

Reach for a JS measurement library only if a specific effect genuinely needs it, and never add one silently.

**AI-slop blacklist (do not emit unless the direction explicitly shows it):**

- Purple or blue gradients as a default
- Generic three-column feature grids
- Center-everything layouts with no hierarchy
- Decorative blobs, waves, or geometric filler
- Stock-photo placeholder boxes
- Generic "Get Started" / "Learn More" CTAs
- Rounded card plus drop shadow as the default component
- Emoji used as UI iconography
- Boilerplate testimonial sections
- The left-text, right-image hero cliché

## Step 5: Preview

Give the user a way to see it:

- **Self-contained HTML:** open the file with a portable opener chain: `open "$FILE" || xdg-open "$FILE" || start "$FILE" || echo "Open in your browser: $FILE"`. If it uses ES modules or fetches, serve the directory instead with `PY=$(command -v python3 || command -v python); "$PY" -m http.server 8000 --bind 127.0.0.1` (Windows Git Bash has `python`, not `python3`) and share `http://localhost:8000/<file>` (change the port if 8000 is taken).
- **Framework component:** render it in the repo's own dev server (`npm run dev` or the project's script) on a throwaway route.

Where a browser automation capability is available (a Playwright or Chrome DevTools MCP, for example), screenshot the page at 375, 768, and 1440px and read the images back to check for text overflow, layout collapse, and broken responsiveness. Fix issues before handing it over.

Where no such capability exists, say so and rely on the user's browser.

## Step 6: Refinement loop

1. Show the reference alongside the live page when one exists.
2. Ask, in plain text: "What should change? Say 'done' when it's right."
3. On "done", "ship it", or "looks good", exit to Step 7.
4. Otherwise apply the feedback with **surgical Edit changes** to the file, not a full rewrite (the user may have made live `contenteditable` tweaks worth keeping). Summarize the change in a line or two, re-screenshot if that capability is available, and loop.

After about ten rounds without "done", ask once, in plain text, whether to keep iterating or call it.

Once the build is called done, polish with `make-interfaces-feel-better` and verify behavior with `qa`.

## Step 7: Extract design tokens (optional)

If no `DESIGN.md` exists, offer once, in plain text, to write one from the tokens you just used (colors, fonts, spacing, radii, shadows). If the user agrees, write `DESIGN.md` to the repo root so later design work stays consistent.

Skip silently if one already exists or the user declines.

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
