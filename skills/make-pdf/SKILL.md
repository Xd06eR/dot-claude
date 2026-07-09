---
name: make-pdf
description: "Docs and artifacts phase: turn a finished Markdown file into a publication-quality PDF with proper margins, page numbers, running headers and footers, styled code blocks and tables, and an optional cover page, table of contents, and draft watermark, using whatever PDF toolchain the machine already has (pandoc with a PDF engine, else a headless browser's print-to-PDF, else styled HTML you print yourself). Use it when a Markdown document needs to become a shareable, printable artifact. Pairs with `document-generate` to write the document first and `diagram` to create figures to embed."
allowed-tools:
  - Bash
  - Read
  - Write
---

# Make PDF

Turn a finished Markdown file into a publication-quality PDF: 1in margins, a running header and footer, page numbers, styled code blocks and tables, and an optional cover page, table of contents, and draft watermark. The renderer is whatever this machine already has, detected at run time, so the skill needs no bundled binary.

**Two rules that do not bend:**
- **Write the PDF next to its source** (same directory, same basename) unless the user names another path.
- **Never install a toolchain.** If nothing usable is present, print the one install command for this OS as plain text and stop. Do not run it.

## Step 1: Locate source and output path

- The source is the `.md` the user pointed at: the open file, the named path, or the one just written by `document-generate`. If it is ambiguous, ask in one plain-text line.
- Output defaults to the source directory, source basename, `.pdf`. Honor an explicit output path if given. Never write outside the working repo.

## Step 2: Detect the PDF toolchain

Probe once, then pick the highest route that has a working tool.

```bash
for t in pandoc weasyprint wkhtmltopdf typst tectonic xelatex lualatex pdflatex \
         chromium chromium-browser google-chrome google-chrome-stable chrome; do
  command -v "$t" >/dev/null 2>&1 && echo "have: $t"
done
```

Route by what is present:

- **A (preferred):** `pandoc` plus any one PDF engine (`weasyprint`, `wkhtmltopdf`, `typst`, `tectonic`, `xelatex`, `lualatex`, `pdflatex`).
- **B:** no pandoc, but a headless Chrome or Chromium binary (or a browser-automation tool your runtime exposes).
- **C (last resort):** neither. Produce styled HTML and hand it to the user to print.

If pandoc is absent and no browser exists either, stop and suggest one of these as plain text (do not run it):

- macOS: `brew install pandoc weasyprint`
- Debian or Ubuntu: `sudo apt install pandoc weasyprint` (or `texlive-xetex` for a LaTeX engine)
- Fedora: `sudo dnf install pandoc weasyprint`

## Step 3, Route A: pandoc + engine (primary)

Pick the first engine present, in this order, and set `--pdf-engine` to it:

1. **weasyprint** or **wkhtmltopdf:** HTML and CSS engines, closest to the essay look. They take a `--css` file, so headers, footers, page numbers, and watermark all come from one stylesheet (Step 6).
2. **typst** or **tectonic:** fast, modern, good defaults, no system LaTeX needed.
3. **xelatex** or **lualatex:** best typography, can use system fonts via `-V mainfont`.
4. **pdflatex:** universal fallback; omit `mainfont` (it cannot load system fonts).

Base command (fill in engine, title, author):

```bash
pandoc SOURCE.md -o OUTPUT.pdf \
  --pdf-engine=ENGINE \
  --toc \
  --highlight-style=pygments \
  --metadata title="TITLE" --metadata author="AUTHOR"
```

Engine-specific additions:

- **weasyprint or wkhtmltopdf:** add `--css=STYLE.css` (Step 6). wkhtmltopdf also takes `--footer-center "[page]"` for page numbers if you skip the CSS.
- **LaTeX engines:** add `-V geometry:margin=1in`; page numbers are automatic; add `-V mainfont="Helvetica Neue"` on xelatex or lualatex only. A custom running header needs `-V header-includes` with `fancyhdr`.
- Drop `--toc` when the document has no headings; some engines error on an empty table of contents.

Other output formats are native, no PDF engine needed:

```bash
pandoc SOURCE.md -o OUTPUT.html --standalone --embed-resources  # one portable HTML file (older pandoc: --self-contained)
pandoc SOURCE.md -o OUTPUT.docx                                 # Word, content fidelity (layout is Word's)
```

## Step 4, Route B: headless browser print-to-PDF (fallback)

When pandoc is absent. Convert Markdown to a styled HTML file, then print it.

1. Markdown to HTML: use any converter present (`markdown-it`, `marked`, or Python's markdown module via `$(command -v python3 || command -v python) -m markdown` since Windows Git Bash ships `python`, not `python3`). Wrap the output in the Step 6 stylesheet. Write it to a temp path (under the system temp dir), not into the repo.
2. Print with a local headless browser:
   ```bash
   chromium --headless --no-pdf-header-footer --print-to-pdf=OUTPUT.pdf file://ABS/PATH/page.html
   ```
   The binary may be `google-chrome` or `chromium-browser`. Add `--no-sandbox` in containers. Drop `--no-pdf-header-footer` when you want Chrome's own header and footer.
3. If your runtime exposes a browser-automation tool instead of a CLI binary, open the HTML in it and use its print-to-PDF action with the same margins and page size.
4. Delete the temp HTML afterward.

**Chromium gotcha:** headless Chrome ignores CSS `@page` margin boxes (`@top-center`, `@bottom-center`). For a running header and page numbers on this route, pass Chrome's header and footer template (or the automation tool's header and footer print options), not CSS. WeasyPrint honors the CSS boxes; Chrome does not.

## Step 5, Route C: HTML for the user to print (last resort)

No PDF tool and no browser binary. Produce the styled HTML (Step 6) next to the source and tell the user, in plain text: open it in a browser, choose Print, then "Save as PDF" with margins at 1in and "Background graphics" on. Report the HTML path.

## Step 6: Publication stylesheet (routes B and C; reusable on route A HTML engines)

Drop-in print CSS carrying the essential look. Reuse it as pandoc `--css` for weasyprint or wkhtmltopdf.

```css
@page {
  size: letter;               /* or A4 */
  margin: 1in;
  @top-center    { content: string(doctitle); font: 9pt Helvetica, "Liberation Sans", sans-serif; color: #666; }
  @bottom-center { content: counter(page) " of " counter(pages); font: 9pt Helvetica, sans-serif; color: #666; }
}
h1 { string-set: doctitle content(); }
body { font: 11pt/1.5 Helvetica, "Liberation Sans", Arial, sans-serif; color: #111; }
h1, h2, h3 { font-weight: 600; page-break-after: avoid; }
code { font-family: "SFMono-Regular", Menlo, Consolas, monospace; }
pre { background: #f6f8fa; padding: .75em 1em; border-radius: 4px; white-space: pre-wrap; page-break-inside: avoid; }
table { border-collapse: collapse; width: 100%; page-break-inside: avoid; }
th, td { border: 1px solid #ddd; padding: .4em .6em; text-align: left; }
img { max-width: 100%; }
.watermark { position: fixed; top: 45%; left: 0; right: 0; text-align: center;
             font-size: 100pt; color: rgba(0,0,0,.08); transform: rotate(-30deg); z-index: -1; }
```

On Linux, correct sans-serif needs `fonts-liberation` (the metric-compatible Helvetica and Arial substitute). Note it if the machine lacks it. For a watermark, add `<div class="watermark">DRAFT</div>` to the HTML; on a LaTeX engine use the `draftwatermark` package via `-V header-includes`.

## Feature knobs (map the user's request onto the route)

| Want | Route A (pandoc) | Routes B and C (HTML and CSS) |
|---|---|---|
| Margins | `-V geometry:margin=1in` (LaTeX), or the CSS on HTML engines | `@page { margin }` |
| Page size | `-V geometry:papersize=a4` | `@page { size: a4 }` |
| Cover page | `title`/`author`/`date` metadata (title block; separate cover with `-V documentclass=report`) | leading `<h1>` plus a subtitle block |
| Table of contents | `--toc` | build a `<nav>` from the headings |
| Page numbers | automatic (LaTeX), or the CSS on HTML engines | `@bottom-center counter(page)` (weasyprint) or Chrome's footer template |
| Watermark | `draftwatermark` package (LaTeX), or the CSS on HTML engines | the `.watermark` div |
| Code highlight | `--highlight-style=pygments` | the stylesheet `pre`/`code` rules |
| Image width | `![](x.png){width=50%}` (pandoc native) | HTML `width` attribute or CSS |

## Diagrams and images

- **Local images** inline automatically (relative paths resolve against the source). They cap at the content width via the stylesheet, so nothing is truncated.
- **Remote images:** pandoc and browsers fetch them at render time. To keep an offline posture, download them first or strip them, and say so if you do.
- **Mermaid fences** render as pictures only if a mermaid renderer is present (`mmdc`, or a pandoc mermaid filter). Without one, the fence stays a code block. Excalidraw fences are not supported by this toolchain; embed a pre-rendered SVG or PNG instead. Authoring a diagram from English is the `diagram` skill's job; embed its output here.

## Step 7: Verify and report

- Confirm the file exists and is non-empty: `test -s OUTPUT.pdf`.
- If `pdfinfo` or `pdftotext` is present, report the page count and confirm the text is selectable: `pdftotext OUTPUT.pdf - | head` should show real words, not spaced-out letters.
- Report the absolute output path and file size. Done.

## Important rules

- **Output beside the source** unless the user names a path. Never write PDFs, HTML, or temp files outside the working repo, except a browser temp file you then delete.
- **Never install anything.** Detect what is present; if nothing fits, print the install command for the user to run.
- **No network image fetches** without telling the user; prefer an offline posture by default.
- **Write no state, metrics, or config anywhere.** The only outputs are the PDF (or the HTML) the user asked for.