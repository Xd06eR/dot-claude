---
name: design-variants
description: "Design-phase visual exploration: turn a screen or component brief into several deliberately-different design variants, rendered as self-contained HTML mockups on one side-by-side comparison page you open in a browser, then collect plain-text feedback and iterate on the favorite. Use when a UI's visual direction is unsettled and you want to see real, contrasting options before committing to one. Once a direction wins, hand off to design-html for production markup; if nothing lands and the direction is still unclear, step back to design-consultation."
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Agent
---

# Design Shotgun

Visual brainstorming, not a review. Generate several deliberately-different design directions as self-contained HTML mockups, put them side by side on one comparison page the user opens in a browser, collect structured feedback, and iterate on the favorite until a direction is locked.

**Core contract:** variants must be genuinely different from each other (a real choice, not three shades of one idea); the user sees them rendered in their own browser; all feedback is plain text; every file this skill writes lands inside the working repo and nowhere else.

Run the flow straight through. Stop only to gather missing brief context (Step 1) and to collect feedback on the board (Step 5). Everything else proceeds without asking.

## Step 1: Build the design brief

A good shotgun needs a brief. Auto-gather what the repo already tells you, then ask the user only for the gaps.

Auto-gather first:

```bash
head -80 DESIGN.md 2>/dev/null || echo "NO_DESIGN_MD"
ls src/ app/ pages/ components/ 2>/dev/null | head -30
```

If `DESIGN.md` exists, follow it as the default visual system and say so: you will not diverge from it unless the user asks you to.

The brief covers five dimensions. Fill what you can infer; ask for the rest:

1. **Who:** the audience, their expertise level.
2. **Job to be done:** what the user is trying to accomplish on this screen.
3. **What exists:** components, pages, and patterns already in the codebase.
4. **User flow:** how users arrive here and where they go next.
5. **Edge cases:** long names, zero results, error states, mobile, first-time versus power user.

For the "I don't like how THIS looks" case, capture the current design as a reference: where a browser-automation capability is available (for example a Playwright or Chrome DevTools MCP tool), screenshot the running page; otherwise ask the user to paste a screenshot or describe what is wrong. Feed that in as the thing to improve on.

Ask the gaps as one plain-text question, and include: how many variants (default 3, up to about 6 for an important screen). Two rounds of context-gathering at most, then proceed with stated assumptions.

## Step 2: Propose the concepts

Before writing any HTML, name the directions. Each concept is a distinct creative direction, not a minor tweak:

```
I'll explore 3 directions:

A) "Name" — one-line visual description (typography, color, layout feel)
B) "Name" — one-line visual description
C) "Name" — one-line visual description
```

Draw on `DESIGN.md`, the brief, and anything the user approved earlier this session.

**Anti-convergence rule (hard requirement):** each variant uses a different font family, a different color palette, and a different layout approach. If two read as siblings (same typographic feel, overlapping color temperature, comparable layout rhythm), one failed: replace it with a deliberately different direction. The test: if you could swap the headline text between two variants without noticing, they are too similar. They should feel like three different design teams, not one team on three coffee levels.

Present the concepts, then proceed to generate immediately. Flag for redirection in the same message and do not block: "Generating these now; reply if you want different directions or a different count and I'll adjust before showing the board."

## Step 3: Generate the variants as HTML mockups

Each variant is one self-contained HTML file: inline CSS (and inline JS only if the interaction is load-bearing), no external assets, no build step, openable directly via `file://`. It renders the actual screen from the brief with realistic placeholder content, not lorem filler that hides layout problems.

Set up an output directory inside the repo:

```bash
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
OUT="$ROOT/design-variants/<screen>"   # kebab-case screen name from the brief
mkdir -p "$OUT"
echo "OUT: $OUT"
```

These are throwaway exploration artifacts. Tell the user they can delete `design-variants/` or add it to `.gitignore` when done.

Write each variant to `$OUT/variant-a.html`, `variant-b.html`, and so on.

**Generation, parallel where available:** where your runtime supports parallel subagents, dispatch one subagent per variant in a single batch so they generate concurrently; otherwise write the files yourself one at a time. Give each subagent the same three-part brief:

- **Goal:** write one self-contained HTML mockup for direction `<letter>` of `<screen>` to `$OUT/variant-<letter>.html`, matching this direction: `<the concept line plus the relevant brief context>`.
- **Acceptance:** file exists and is non-empty; opens standalone with no external requests; distinct font, palette, and layout from the other directions; meets the quality bar below.
- **Report:** the file path and a one-line description of the direction realized; note anything skipped.

**Quality bar for every variant (bake in, do not bolt on):**

- Scannable: clear visual hierarchy, prominence tracks importance, one obvious primary action.
- Clickable things look clickable without hover; mobile has no hover to lean on.
- Follow conventions (logo top-left, nav where expected) unless the direction has a real reason not to.
- Kill noise: cut filler words, avoid clutter, group related things.
- Mobile-safe: touch targets at least 44px, layout holds at narrow widths.

After generation, report which variants succeeded and which failed, with the reason for any failure. Never silently drop a failed variant. If every variant failed, fall back to writing them yourself sequentially and say so.

## Step 4: Build the comparison board

Write one board page next to the variants that embeds them side by side. Discover the variant files rather than hardcoding a list (re-derive the path first; a fresh shell will not have Step 3's variables):

```bash
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
OUT="$ROOT/design-variants/<screen>"
ls "$OUT"/variant-*.html
```

Board template (write to `$OUT/board.html`, one `<figure>` per variant that exists, with its concept name in the caption):

```html
<!doctype html>
<meta charset="utf-8">
<title>Design variants — <screen></title>
<style>
  body { margin:0; font:14px system-ui,sans-serif; color:#111; background:#fff; }
  h1 { padding:12px 16px; margin:0; font-size:16px; }
  .grid { display:grid; gap:12px; padding:12px;
          grid-template-columns:repeat(auto-fit,minmax(360px,1fr)); }
  figure { margin:0; border:1px solid #ccc; border-radius:8px; overflow:hidden; }
  figcaption { padding:8px 12px; font-weight:600; background:#f4f4f4; }
  iframe { width:100%; height:640px; border:0; display:block; background:#fff; }
</style>
<h1>Design variants — <screen> (open each in a new tab to interact full-size)</h1>
<div class="grid">
  <figure><figcaption>A — <name></figcaption><iframe src="variant-a.html"></iframe></figure>
  <figure><figcaption>B — <name></figcaption><iframe src="variant-b.html"></iframe></figure>
  <figure><figcaption>C — <name></figcaption><iframe src="variant-c.html"></iframe></figure>
</div>
```

Open it in the user's default browser (portable, falls back to printing the path):

```bash
open "$OUT/board.html" 2>/dev/null || xdg-open "$OUT/board.html" 2>/dev/null \
  || start "$OUT/board.html" 2>/dev/null \
  || echo "Open this in your browser: $OUT/board.html"
```

## Step 5: Collect feedback and iterate

The board is the chooser. Ask for feedback in plain text, one message, this shape:

```
Take a look at the board. Tell me:
- Which variant is closest? (A / B / C)
- What to KEEP from it (and anything worth stealing from the others)?
- What to CHANGE?
- Optional: rate each 1-5.
```

The user answers in prose. Read back what you understood before acting:

```
PREFERRED: <variant>
KEEP: <points>
CHANGE: <points>
DIRECTION: <one-line synthesis>
```

**Iterate:** regenerate the preferred variant (and any others the user wants reworked) applying the feedback, rebuild the board with the new files, and reopen it. Each round is cheap and reversible, so keep looping until the user approves a direction. If the feedback says "none of these," treat it as a new concept round: go back to Step 2 with what you learned.

## Step 6: Lock the direction and hand off

When the user approves, restate the winning direction plainly: which variant, the font, palette, and layout choices that defined it, and the path to its HTML file. That description is the handoff artifact.

Then offer next steps in plain text:

- **Finalize:** hand the approved variant to `design-html` to generate production markup and CSS from it.
- **Iterate more:** another refinement round on the winner (back to Step 5).
- **Rethink the system:** if no variant really landed and the visual direction is still unclear, step back to `design-consultation` to rebuild the design system before shooting again.
- **Done:** leave the variants in `design-variants/` for later.

## Important rules

- **Exploration, not review:** the goal is to surface real, contrasting options fast, then narrow. Do not polish one variant while the direction is still open.
- **Variants must genuinely differ.** Enforce the anti-convergence rule in Step 2; a set of near-identical variants is a failed run.
- **Self-contained HTML only.** No external assets, no build step, no server. The user must be able to open any file directly.
- **Plain-text feedback.** The board shows the options; the user replies in prose. Read the feedback back before iterating.
- **Stay inside the working repo.** Write only under `design-variants/` (or a directory the user names). Write no state, taste profiles, metrics, or config anywhere else.
- **Report failures.** If a variant fails to generate, say which and why; never present a partial set as if it were complete.