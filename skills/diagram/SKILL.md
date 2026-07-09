---
name: diagram
description: "Design phase: turn an English description or mermaid source into a diagram source file (`.mmd`) plus rendered SVG/PNG. To edit visually, paste the mermaid source at excalidraw.com (auto-converts to editable elements). Chain into `document-generate` or `make-pdf` when a document needs the figure embedded."
allowed-tools:
  - Bash
  - Read
  - Write
  - Grep
---

# Diagram — English in, source out

Turn a description or mermaid source into a diagram artifact set. All outputs go into `./diagrams/` (or the repo root if that directory doesn't exist), named with a kebab-case slug derived from the diagram's subject.

**Deliverables:**

| File | Purpose |
|---|---|
| `<slug>.mmd` | Mermaid source — the LLM-readable, version-controllable core |
| `<slug>.svg` + `<slug>.png` | Rendered outputs (where mermaid-cli is installed) |

**Excalidraw editing:** paste the `.mmd` source at https://excalidraw.com — it auto-converts mermaid to editable elements. No local `.excalidraw` file is generated; the web app's built-in converter is the reliable path (the `@excalidraw/mermaid-to-excalidraw` npm package requires a browser DOM and cannot run in Node.js).

## Step 1: Author the mermaid source

Write mermaid for the user's request. Prefer flowcharts (`graph LR`/`graph TD`) — they convert cleanly to editable Excalidraw elements when pasted at excalidraw.com. Sequence, state, and ER diagrams render fine as SVG/PNG; at excalidraw.com they paste as a single image, not editable elements.

Keep node labels short; put detail in edge labels. 5-15 nodes is the readable range. More than that, split into multiple diagrams and say why.

Write the source file to `<outdir>/<slug>.mmd` using the Write tool.

## Step 2: Excalidraw editing path (via excalidraw.com)

Excalidraw's web app natively imports mermaid and converts it to editable elements. Do NOT hand-roll `.excalidraw` JSON: the schema binds text labels to shapes via `containerId`/`boundElements` (separate elements, not inline properties), and hand-rolled JSON opens with shapes but no labels. The official converter at excalidraw.com handles the binding correctly.

For the user:
1. Open https://excalidraw.com
2. Paste the `.mmd` source from Step 1
3. Excalidraw auto-converts: flowcharts become editable boxes, arrows, and labels; other diagram types paste as an SVG image

## Step 3: Render to SVG and PNG (where mermaid-cli is installed)

Detect if `mmdc` (mermaid-cli) is available:

```bash
if ! command -v mmdc >/dev/null 2>&1; then
  echo "mermaid-cli not found. To render SVG/PNG, install it:"
  echo "  npm install -g @mermaid-js/mermaid-cli"
  echo "Continuing with source only."
  RENDER=false
else
  RENDER=true
fi
```

If available, render:

```bash
if [ "$RENDER" = true ]; then
  mmdc -i <outdir>/<slug>.mmd -o <outdir>/<slug>.svg -b transparent
  mmdc -i <outdir>/<slug>.mmd -o <outdir>/<slug>.png -s 3 -b transparent
fi
```

For PNG, `-s 3` gives ~300dpi output. If mermaid-cli is missing, deliver `.mmd` with the installation note and the excalidraw.com paste option.

## Step 4: Deliver

1. If `.png` was generated, read it with the Read tool so the user sees the diagram inline.
2. List the generated file paths.
3. Editability note: "Paste the `.mmd` source at https://excalidraw.com to edit visually."
4. If the user wants changes, edit the `.mmd` source and re-run Step 3 — the source is the single source of truth.

## Important rules

- **Never ship without at least the source.** The `.mmd` file is the core deliverable.
- **Cleanup:** no temporary files remain. All outputs go into the target directory.
- **For PDFs:** remind the user that `make-pdf` renders mermaid fences natively — embedding the `.mmd` source in markdown is better than embedding the PNG.

## Completion status

- **DONE**: `.mmd` source plus rendered SVG/PNG delivered and shown.
- **DONE_WITH_NOTE**: source delivered, rendering skipped due to missing mermaid-cli with installation guidance.
- **BLOCKED**: unable to write outputs (permissions, disk full).