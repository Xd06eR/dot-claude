---
name: document-generate
description: "Docs and artifacts phase: generate missing documentation by reading what the code actually does. Use when a codebase has behavior that is real but undocumented. Returns structured docs (README sections, API reference, architecture overviews, usage examples). After generating, consider `diagram` for architecture figures, `make-pdf` to turn the doc set into a distributable, and `document-release` to keep docs current after a later ship."
allowed-tools: Bash, Read, Write, Edit, Grep, Glob
origin: gstack
---

# Document Generate

Produce accurate, structured documentation for a feature, module, or whole project by deriving every claim from the code itself. The value is fidelity: docs that match what the code actually does, with real signatures, real defaults, and examples that would run if pasted.

**Philosophy: research the whole, then write the parts.** Read the full surface before writing a line. This is what prevents the common failure of docs that describe half a feature.

**Doc-safety rule (non-negotiable):** writing and editing doc files in the working tree is local and reversible, so do it directly. This skill never runs the commit, push, or PR/MR commands and never mutates a remote. The final commit is prepared and OUTPUT as a block for the user to run by hand.

You organize output by the **Diataxis** quadrants, each serving a different reader:

- **Reference:** information-oriented. Complete, accurate technical description. The foundation.
- **Explanation:** understanding-oriented. Why it works this way, and the trade-offs.
- **How-to:** task-oriented. Steps to accomplish a specific goal, assuming basic familiarity.
- **Tutorial:** learning-oriented. A newcomer from zero to a first working result.

This skill runs standalone ("document this"), or is called by `document-release` to fill coverage gaps it found.

## Step 1: Scope and output target

1. Fix the scope. A named target (feature, module, file) scopes to that target. "The project" scopes to the whole surface. Called from `document-release`, the scope is the specific entities in its coverage-gap list.
2. Pick where docs land by matching what the repo already does, and state the choice:
   - A `docs/` directory or a doc framework (Docusaurus, MkDocs, Nextra, VitePress) exists then follow its layout and format.
   - Otherwise write deep docs as plain Markdown under `docs/` and add short inline summaries to `README.md`. This maximizes both depth and discoverability.
3. Only stop to ask, in plain text, when the target itself is ambiguous (two readings that produce materially different docs). Output placement is reversible, so choose the default above and proceed.

## Step 2: Codebase archaeology (research)

**The most important step. Do not rush it. Documentation quality tracks how well you understand the code.**

1. Map the structure:

```bash
find . -type f -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./build/*" -not -path "./.next/*" -not -path "./target/*" | head -200
```

2. Read the entry points: `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `CLAUDE.md` / `AGENTS.md`; the manifest (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`) to learn the project type; the main entry files; config files and examples.
3. Read the source for each target entity, end to end, not just signatures. Read the tests too: they reveal intended behavior, edge cases, and real usage. Read the modules the target depends on and the modules that depend on it. Read inline comments, especially `NOTE`, `DESIGN`, `WHY`.
4. Build a concept map before writing:

```
Target:          [feature/module name]
Purpose:         [one sentence: what problem it solves]
Key concepts:    [the 3-5 concepts a reader must understand]
Public surface:  [commands, functions, config options, endpoints, with real signatures]
Dependencies:    [what it needs from other modules]
Dependents:      [what relies on it]
Edge cases:      [from reading tests and code]
Design choices:  [any non-obvious "why", from comments, ADRs, or git history]
```

5. Report: "Researched N files, K public-surface items, M concepts, J design decisions."

## Step 3: Diataxis partitioning

Decide which quadrants each entity needs. Not every entity needs all four.

| Entity type | Tutorial | How-to | Reference | Explanation |
|---|---|---|---|---|
| Feature a user interacts with | yes | yes | yes | maybe |
| CLI command or flag | maybe | yes | yes | no |
| Internal module / architecture | no | no | yes | yes |
| Config option | no | yes | yes | no |
| Design pattern / philosophy | no | no | no | yes |
| API endpoint | maybe | yes | yes | no |
| Multi-step workflow | yes | yes | no | maybe |

Print the partition plan (entity, and per quadrant whether it is new, inline, or skipped). If it exceeds 5 documents, say so plainly and proceed unless the scope was meant to be narrower; the docs are reversible and the user can redirect.

## Step 4: Reference docs (write these first)

Reference is the foundation: factual, complete, derived straight from code. It fixes the vocabulary the other quadrants reuse.

```markdown
# [Entity Name]

[One paragraph: what it is, what it does, when you would use it.]

## API / Interface

[Complete public surface: functions, commands, config options, parameters, with
types, defaults, and constraints. Pull directly from code; do not paraphrase loosely.]

## Options / Configuration

[If applicable: every option with type, default, and effect.]

## Examples

[2-3 concrete examples that would actually run if pasted. Prefer real output.]

## Related

[Links to the how-to, tutorial, or explanation for this entity.]
```

Rules:

- Accuracy over elegance, every claim traceable to code.
- Give types, defaults, and constraints ("a string matching `^[a-z-]+$`, max 256 chars", not "a string").
- Do not explain *why* here. That is the explanation doc's job.

## Step 5: Explanation docs

Explanation answers "why does it work this way?" It is the design rationale.

```markdown
# [Concept / Design Decision]

[Opening: the problem this design solves, in terms a reader who has not seen the
code would understand.]

## The problem

[What goes wrong without this design. Real failure modes, not abstract risks.]

## The approach

[How the design solves it. Use an ASCII or Mermaid diagram for architecture.]

## Trade-offs

[What was given up. Every decision trades something; name it.]

## Alternatives considered

[From code comments, ADRs, or git history: what was tried or rejected, and why.]
```

Rules:

- Lead with the problem, not the solution.
- Name trade-offs explicitly ("we chose X over Y because Z").
- Do not repeat reference material. Link to it instead.
- ASCII diagrams are grep-able and render everywhere. For a richer figure, hand the description to the `diagram` skill.

## Step 6: How-to guides

Task-oriented. The reader knows the basics and wants to accomplish one specific thing.

```markdown
# How to [accomplish specific task]

[One sentence: what you will accomplish and the end result.]

## Prerequisites

[What the reader needs first: versions, installed tools, config state.]

## Steps

1. [Action verb] [specific instruction]

   ```bash
   [exact command]
   ```

   [Expected output, if non-obvious.]

2. [Next step...]

## Verification

[How to confirm it worked: a command, a URL, a test.]

## Troubleshooting

[Common failure modes and fixes, pulled from the error-handling code and tests.]
```

Rules:

- The title starts with "How to".
- Every step is actionable ("Run X", "Add Y to Z"), never "consider whether".
- Include verification so the reader never wonders if it worked.
- Troubleshooting is mandatory when the task can fail.

## Step 7: Tutorials

Learning-oriented. A newcomer from zero to a working example. The hardest to write well and the most valuable.

```markdown
# [Tutorial title: what you will build or learn]

[Opening: what you will build and understand by the end. Concrete: "You will build
a working X that does Y", not "This tutorial covers X".]

## What you'll need

[Prerequisites: tools, versions, prior knowledge, with links.]

## Step 1: [Set up the foundation]

[Start from a clean state. Show every command. Explain briefly on first encounter.]

## Step 2: [First working piece]

[Get to a visible result fast: the reader should see something work within 3 steps.]

## Step N: [Final step]

## What you built

[Recap what the reader now has, link to reference docs, suggest next steps.]
```

Rules:

- **Time to first result under 3 steps.**
- Every step produces a visible change.
- No "now configure X" without showing what changes.
- Use the exact commands the reader types.
- Show common errors and their fix inline.
- Close with "What you built" tying back to the real use case.

## Step 8: Cross-link and verify discoverability

1. Cross-link the quadrants: reference links to its how-to, how-to links back to reference, tutorials link to both.
2. Update entry points: add the new docs to `README.md` (documentation section or table of contents), to `CLAUDE.md` / `AGENTS.md` project structure if relevant, and to any docs framework sidebar or nav config.
3. Every new document must be reachable within 2 clicks from `README.md`.
4. Check for broken links: use Grep to find relative Markdown links (`](./` and `](../` and `](docs/`) in the files you wrote or edited, and confirm each target file exists.

## Step 9: Quality self-review

Review each document against these gates. Fix every failure before handing off. This is the accuracy contract.

**Accuracy:**

- [ ] Every code example runs / compiles / passes if pasted.
- [ ] Every API description matches the actual signature in the source.
- [ ] Every command shown produces the output described.
- [ ] No stale references to renamed or removed entities.

**Completeness:**

- [ ] Reference docs cover 100% of the public surface found in Step 2.
- [ ] How-tos cover the top tasks a user would attempt.
- [ ] Tutorials reach a working result in 3 steps or fewer.
- [ ] Explanation docs name trade-offs, not just choices.

**Voice:**

- [ ] Written for a smart reader who has not seen the code.
- [ ] Jargon glossed briefly on first use.
- [ ] Active voice, concrete nouns, short sentences. "You can now..." over "The system provides...".

## Step 10: Hand off the commit

Docs are written and self-reviewed. Now scan for leaked secrets, then output the commit block. Do NOT execute any git command yourself.

Docs derived from source sometimes echo a real credential. Scan the files you created or edited. If a live-format secret shows up (and is not an obvious `EXAMPLE` placeholder), remove it before handing off:

```bash
# Replace <new-doc-paths> with the files you wrote. Flag, do not commit past a hit.
grep -rEn '(AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|gh[pousr]_[0-9A-Za-z]{36}|xox[baprs]-[0-9A-Za-z-]+)' <new-doc-paths> 2>/dev/null | grep -vi example
```

Detect the host for the PR/MR line: `git remote get-url origin` containing `github.com` then GitHub, containing `gitlab` then GitLab, else git-native (omit the PR line). Then prepare the block. Prefix it plainly for the user:

> Run these to commit the docs. Review the staged files and message first. Nothing here has been executed.

Do NOT execute any of it yourself:

```bash
# OUTPUT ONLY: do not execute; show this block to the user
git add <the doc files you created or edited>
git commit -m "docs: document <scope> (reference, how-to, tutorial, explanation as applied)"
git push
```

If a PR/MR exists for this branch, also output the body-update command in the same OUTPUT ONLY form (GitHub `gh pr edit --body`, GitLab `glab mr update --description`) with a docs section listing each new file, its quadrant, and a one-line description. Never run it yourself. Do not open a second PR/MR.

Then report:

```
Documentation generated:
  Scope:      [what was documented]
  Files:      [N] new, [M] updated
  Reference:  [count] ([files])
  Explanation:[count] ([files])
  How-to:     [count] ([files])
  Tutorial:   [count] ([files])
  Quality:    [pass/fail per gate]
```

## Important rules

- **Research before writing.** Step 2 is not optional. Insufficient research produces surface-level docs.
- **Accuracy is non-negotiable.** Every example works. Every API description matches the code. If unsure about a detail, read the source again. Never guess.
- **Keep the quadrants distinct.** Do not mix tutorial content into reference, or reference into how-tos. Each serves a different reader in a different mode.
- **Cross-link everything.** Isolated docs are undiscoverable docs.
- **Match the repo's existing doc style and layout.** Do not impose a new one.
- **Never run the commit, push, or PR/MR commands.** Prepare and output them. The user runs them. Stay inside the working repo: write no state, metrics, or config files anywhere else.
- **Completeness over minimalism.** AI makes thorough docs cheap. Write the complete set, not a minimal stub.
