---
name: diagram
description: "Design phase: turn an English description or mermaid source into a diagram triplet: `.mmd` source, an editable `.excalidraw` file (flowcharts, via the bundled converter), and rendered SVG/PNG where mermaid-cli is installed."
allowed-tools: Bash, Read, Write, Grep
origin: gstack
---

Turn a description or mermaid source into a diagram artifact set. All outputs go into `./diagrams/` (or the repo root if that directory doesn't exist), named with a kebab-case slug derived from the diagram's subject.

**Deliverables:**

| File | Purpose |
|---|---|
| `<slug>.mmd` | Mermaid source — the LLM-readable, version-controllable core |
| `<slug>.excalidraw` | Editable Excalidraw file (flowcharts, via the bundled converter) |
| `<slug>.svg` + `<slug>.png` | Rendered outputs (where mermaid-cli is installed) |

## Step 1: Author the mermaid source

Write mermaid for the user's request. Prefer flowcharts (`graph LR`/`graph TD`) — they convert cleanly to editable Excalidraw elements when pasted at excalidraw.com. Sequence, state, and ER diagrams render fine as SVG/PNG. At excalidraw.com they paste as a single image, not editable elements.

Keep node labels short. Put detail in edge labels. 5-15 nodes is the readable range. More than that, split into multiple diagrams and say why.

Write the source file to `<outdir>/<slug>.mmd` using the Write tool.

## Step 2: Generate the .excalidraw file (flowcharts)

For flowcharts (`graph LR`/`graph TD`), run the bundled converter — it emits valid Excalidraw JSON with text labels correctly bound to shapes via `containerId`/`boundElements`. Never hand-roll `.excalidraw` JSON yourself: inline `text` properties on shapes silently render with no labels.

```bash
PY=$(command -v python3 || command -v python)
"$PY" <path-to-this-skill>/gen_excalidraw.py <outdir>/<slug>.mmd > <outdir>/<slug>.excalidraw
```

The converter writes the JSON to stdout (redirect it). On a non-flowchart input it exits 2 with a note and writes nothing, so an empty output file means skip and fall back to the paste path.

The converter parses the flowchart subset (nodes, edges, labels, shapes). It skips subgraphs and styling directives and prints a note when it does. Layout is a simple layered grid — the file is a drag-to-refine starting point, not a finished layout. The SVG/PNG from Step 3 stays the ground-truth render.

For non-flowchart types (sequence, state, ER), skip the converter and give the user the paste path instead: open https://excalidraw.com and paste the `.mmd` source. Flowcharts become editable elements there. Other types paste as an image. If the converter errors on a valid flowchart, fall back to the same paste note and say so.

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
3. Editability note: "Open the `.excalidraw` file at excalidraw.com (or a local Excalidraw) to refine visually" — or the paste path for non-flowcharts.
4. If the user wants changes, edit the `.mmd` source and re-run Steps 2-3 — the source is the single source of truth.

## Important rules

- **Never ship without at least the source.** The `.mmd` file is the core deliverable.
- **Cleanup:** no temporary files remain. All outputs go into the target directory.

## Completion status

- **DONE**: `.mmd` source, `.excalidraw` (flowcharts), and rendered SVG/PNG delivered and shown.
- **DONE_WITH_NOTE**: source delivered. Rendering or conversion skipped (missing mermaid-cli, non-flowchart type, or converter fallback) with guidance.
- **BLOCKED**: unable to write outputs (permissions, disk full).

## Chaining

Chain into `document-generate` when a generated document needs the figure embedded.
