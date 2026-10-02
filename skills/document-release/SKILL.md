---
name: document-release
description: "Use after a release lands (typically following `ship`, `land-and-deploy`, or `deploy-watch`): sweep the repo's docs and update everything the shipped change made stale. Returns the commit and PR-body update for the user to run. For net-new docs from scratch, use `document-generate`."
origin: gstack
---

Post-ship documentation sweep. After a release lands (or a feature branch is about to merge), every doc file in the repo should match what shipped. This skill reads the diff, audits each doc against it, fixes clear factual drift, polishes CHANGELOG voice, flags coverage gaps, and outputs the commit plus PR body update for the user to run.

**Git safety rule (non-negotiable):** this skill never runs the commit, push, or PR-edit commands, and never mutates a remote. It does the local doc edits itself and OUTPUTS the rest as a command block. The final terminal action is always the user's.

**Scope:** edits stay inside the working repo's doc files. No metrics, state, telemetry, or config files written anywhere else.

Most updates are obvious and direct. Stop and ask in plain text only for:

- Risky or subjective doc changes: narrative, philosophy, security model, section removal, large rewrites.
- VERSION drift: code changes on the branch but no version bump (route back to `ship`'s Step 6).
- Cross-doc contradictions that are narrative, not factual.
- Capturing newly-deferred work in TODOS.

Never stop for:

- factual corrections sourced from the diff
- adding items to tables or lists
- updating paths/counts/version numbers
- fixing stale cross-references
- minor CHANGELOG wording
- marking completed TODOs
- fixing cross-doc factual mismatches

Never do: overwrite or regenerate CHANGELOG entries (polish wording only), bump VERSION (that is `ship`'s step), or use a Write tool on CHANGELOG.md (Edit with exact matches only).

## Step 1: Detect platform and base branch

Detect the host from the remote:

```bash
git remote get-url origin 2>/dev/null
```

- URL contains `github.com` then GitHub.
- Else probe `gh auth status`; on success GitHub, on failure unknown (git-native only).

Find the base branch (the PR target, else the repo default):

- GitHub: `gh pr view --json baseRefName -q .baseRefName`, else `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`.
- Git-native fallback: `git symbolic-ref refs/remotes/origin/HEAD | sed 's|refs/remotes/origin/||'`, else try `origin/main`, then `origin/master`, then default to `main`.

Print the detected base branch. Substitute it for `<base>` everywhere below.

## Step 2: Pre-flight and diff analysis

1. `git branch --show-current`. If it equals `<base>` or the default, **abort**: "You're on the base branch. Run from a feature branch."

2. Understand the changeset:
   ```bash
   git diff <base>...HEAD --stat
   git log <base>..HEAD --oneline
   git diff <base>...HEAD --name-only
   ```

3. Discover all doc files in the repo (POSIX find; widen or add extensions if the repo uses `.rst`, `.adoc`, or a deeper `docs/` tree):
   ```bash
   find . -maxdepth 2 -name "*.md" \
     -not -path "./.git/*" \
     -not -path "./node_modules/*" \
     -not -path "./vendor/*" \
     | sort
   ```

4. Classify the changes into: **new features**, **changed behavior**, **removed functionality**, **infrastructure**. This drives the audit in Step 4.

5. Print a one-line summary: "Analyzing N files changed across M commits. Found K doc files to review."

If the release scope is unclear (no CHANGELOG entry, ambiguous diff, multiple merged branches), ask in plain text: "I can't tell what shipped in this release. Point me at the CHANGELOG entry, the merge commit, or the tag, and I'll work from that." Do not guess.

## Step 3: Coverage map (blast-radius analysis)

Before touching any doc, map what shipped against what's documented. This is the Diataxis framework (reference / how-to / tutorial / explanation) applied as an audit lens, not a generation tool.

1. Extract public-surface changes from the diff: new exported functions, classes, CLI commands, flags, config options, API endpoints, env vars, feature flags; renamed or removed public surface; new user-facing capabilities.

2. For each item, assess coverage:

   ```
   Coverage map:
     [entity]         [reference?] [how-to?] [tutorial?] [explanation?]
     /new-skill       yes AGENTS.md  no        no          no
     --new-flag       yes README     yes README no         no
     FooProcessor     no            no        no          no
   ```

   - **Reference**: what it is, its API, its options (README tables, AGENTS.md skill lists, API docs).
   - **How-to**: task-oriented: "how to do X with this" (README examples, CONTRIBUTING workflows).
   - **Tutorial**: step-by-step for newcomers (getting-started guides).
   - **Explanation**: why it works this way (ARCHITECTURE decisions, design rationale).

3. Items with zero coverage are **critical gaps**: flag them for Step 11 and the PR body. Reference-only items are **common gaps**. The map informs later steps; it never auto-generates docs. When significant gaps exist, suggest `document-generate` as the follow-up.

4. **Diagram drift detection.** If ARCHITECTURE.md or any doc contains ASCII or Mermaid diagrams, extract entity names (modules, services, data flows). Cross-reference against the diff. Flag any diagram entity that was renamed, split, removed, or moved in the code. Diagram edits need human judgment: flag in the PR body, never auto-edit.

## Step 4: Per-file audit

Read each doc file and cross-reference it against the diff. Apply generic heuristics, adapted to the repo:

- **README.md**: Does it describe all features visible in the diff? Are install/setup instructions consistent? Are examples, demos, usage descriptions still valid? Are troubleshooting steps accurate?
- **ARCHITECTURE.md**: Do diagrams and component descriptions match the code? Are design rationales still accurate? Be conservative: only flag things clearly contradicted by the diff.
- **CONTRIBUTING.md**: Walk the setup as a brand-new contributor. Are commands accurate? Would each step succeed? Do test-tier descriptions match current infrastructure? Flag anything that would fail or confuse a first-timer.
- **CLAUDE.md / project instructions**: Does the structure section match the actual file tree? Are listed commands and scripts accurate? Do build/test instructions match the manifests?
- **Other `.md` / `.rst` / `docs/`**: Determine purpose and audience. Cross-reference against the diff.

For each file, classify each needed update as:

- **Auto-update**: factual corrections clearly warranted by the diff (add an item to a table, update a path, fix a count, update a structure tree).
- **Ask user**: narrative changes, section removal, security-model changes, large rewrites (roughly 10+ lines in one section), ambiguous relevance, entirely new sections.

Never auto-update: README introduction or project positioning, ARCHITECTURE philosophy or design rationale, security-model descriptions, or remove an entire section.

## Step 5: Apply auto-updates

Make every clear factual update directly with Edit. For each file modified, print a one-line summary naming what specifically changed, not just "Updated README.md" but "README.md: added /new-skill to skills table, updated skill count from 9 to 10."

## Step 6: Ask about risky changes

For each item classified "Ask user" in Step 4, ask in plain text. State the file, the specific decision, the recommendation, and the options (one of which is always "Skip: leave as-is"). Apply approved changes immediately after each answer.

## Step 7: CHANGELOG voice polish

**Never clobber, reorder, or regenerate CHANGELOG entries.** Polish wording only.

1. Read the entire CHANGELOG.md first.
2. If CHANGELOG was not modified on this branch, skip this step.
3. If it was modified, score each entry 0 to 3:
   - **1 point**: answers "What changed?" (names the feature or fix).
   - **1 point**: answers "Why should I care?" (user impact, pain removed).
   - **1 point**: answers "How do I use it?" (command, flag, link to docs).
   - **Entries scoring below 2 need a rewrite. Entries scoring 3 are gold.**
4. Rewrite low-scoring entries to lead with what the user can now **do**, not implementation details. "You can now..." rather than "Refactored the...". Move internal or contributor-only changes to a `### For contributors` subsection.
5. Use Edit with exact `old_string` matches. Never use Write on CHANGELOG.md.
6. Auto-fix minor wording adjustments. If a rewrite would alter meaning, ask in plain text first.

## Step 8: Cross-doc consistency and discoverability

After auditing each file individually, do a cross-doc pass:

1. Does the README's feature list match what CLAUDE.md (or project instructions) describes?
2. Does ARCHITECTURE's component list match CONTRIBUTING's structure description?
3. Does CHANGELOG's latest version match the VERSION file (if one exists)?
4. **Discoverability:** every doc file should be reachable from README.md or CLAUDE.md. If ARCHITECTURE.md exists but neither entry-point links to it, flag it.
5. Auto-fix clear factual inconsistencies (a version mismatch). Ask in plain text for narrative contradictions.

## Step 9: TODOS cleanup

Skip if no TODOS.md (or equivalent backlog file) exists.

1. **Completed items not yet marked.** Cross-reference open TODOs against the diff. If one is clearly completed by the changes, move it to the Completed section with a version and date. Be conservative: only mark items with clear evidence in the diff.
2. **Stale descriptions.** If a TODO references files or components that changed significantly, ask in plain text whether to update, complete, or leave it.
3. **New deferred work.** Scan the diff for `TODO`, `FIXME`, `HACK`, `XXX` comments. For each one that represents meaningful deferred work (not a trivial inline note), ask in plain text whether to capture it in TODOS.

## Step 10: VERSION consistency check

This skill never bumps VERSION; the bump decision is `ship`'s Step 6. What you do here is verify the shipped version and the docs agree:

1. No VERSION file (or equivalent version source like `package.json` `.version`, `pyproject.toml`, `Cargo.toml`): skip silently.
2. Check whether VERSION was bumped on this branch:
   ```bash
   git diff <base>...HEAD -- VERSION
   ```
3. **Not bumped:** docs-only changes need no bump — continue. If the branch carries code changes that lack a version bump, stop and tell the user to re-run `ship`'s version step.
4. **Already bumped:** read the CHANGELOG entry for the current VERSION. If significant branch changes are uncovered by it, ask in plain text whether to fold them into the existing entry or route back to `ship`.

## Step 11: Output the commit, push, and PR-body update

You have audited, edited, polished, and (if approved) bumped. Now assemble the commands.

**Do NOT execute the commit/push/PR block below — output it for the user to run.** The `git status` precheck is read-only and fine to run yourself.

First check whether any doc files were modified:

```bash
git status
```

If no documentation files were modified by any previous step, print "All documentation is up to date." and stop.

Otherwise, output the block below. Stage files by name, never `git add -A` or `git add .`.

- Group into a single docs commit unless the change is large enough to split logically.
- Conventional commits, subject only, descriptive.

GitHub:

```bash
# OUTPUT ONLY: do not execute; show this block to the user
git add <modified doc files>
git commit -m "docs: update documentation for <version or short scope>"
git push
gh pr edit --body "$(cat <<'EOF'
<existing PR body>

## Documentation
- <one line per doc file: what specifically changed>

### Documentation debt
- <critical gaps from the coverage map: zero-coverage public surface>
- <common gaps: reference-only items>
- <stale diagrams flagged in Step 3>
EOF
)"
```

If no PR exists yet, skip the body update with a note. If `gh pr edit` fails, warn and continue: the documentation changes are still in the commit.

## Step 12: Documentation health summary

Print a scannable summary of every doc file's status:

```
Documentation health:
  README.md       <status> (<details>)
  ARCHITECTURE.md <status> (<details>)
  CONTRIBUTING.md <status> (<details>)
  CHANGELOG.md    <status> (<details>)
  TODOS.md        <status> (<details>)
  VERSION         <status> (<details>)
```

Status is one of: Updated, Current, Voice polished, Not bumped (user chose to skip), Already bumped, Skipped (file does not exist).

If the coverage map found gaps, append:

```
Documentation coverage:
  [entity]         [reference] [how-to] [tutorial] [explanation]
  /new-skill       yes         no       no         no
  --new-flag       yes         yes      no         no

Diagram drift:
  ARCHITECTURE.md: "FooProcessor" renamed to "BarProcessor" — diagram may be stale
```

If coverage is complete and no diagrams drifted, output: "Coverage: all shipped features have adequate documentation."

## Important rules

- **Never run the commit, push, or PR-edit commands yourself.** Prepare and output them; the user runs them.
- **Never clobber CHANGELOG entries.** Polish wording only, via Edit with exact matches.
- **Never bump VERSION.** Drift or a missing bump routes back to `ship`'s Step 6 (Step 10).
- **Read a file before editing it.**
- **Be explicit about what changed.** Every edit gets a one-line summary naming the specific change.
- **Coverage map informs, never generates.** Flag gaps in the PR body; do not auto-write missing doc pages. Suggest `document-generate` as the follow-up when gaps are significant.
- **Diagram drift is advisory.** Flag stale diagrams in the PR body; never auto-edit ASCII art or Mermaid blocks.
- **Stay inside the working repo.** Write no state, metrics, or config files anywhere else.
- **Voice: friendly, user-forward, not obscure.** Write like you're explaining to a smart person who hasn't seen the code.

After this skill runs, the user has updated doc files, a polished CHANGELOG, a coverage map of any remaining gaps, and a ready-to-paste commit and PR-body block.
