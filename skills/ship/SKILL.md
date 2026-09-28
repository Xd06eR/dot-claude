---
name: ship
description: Use when a feature or fix is complete, tested, and ready to leave the branch. Prepares the exact commit, push, and PR commands for you to run.
allowed-tools: Bash, Read, Edit, Grep
origin: gstack
---

Take a finished, tested feature branch to a reviewable, mergeable state: merge the base branch, run tests, review the diff, bump VERSION, update CHANGELOG, then hand back the exact commit, push, and PR commands.

**Git safety rule (non-negotiable):** this skill never runs the commit, push, or PR-create commands, and never mutates a remote. It does the local, reversible prep itself (merge base, run tests, edit VERSION and CHANGELOG) and OUTPUTS the rest as a command block for the user to run by hand. The final terminal action is always the user's.

Run the prep straight through without asking for trivial confirmations. Stop only for: being on the base branch, merge conflicts you cannot safely resolve, failing tests introduced by this branch, or a VERSION bump decision (Step 6 proposes it and waits).

## Step 1: Detect platform and base branch

Detect the host from the remote, then the branch this work targets.

```bash
git remote get-url origin 2>/dev/null
```

- URL contains `github.com` then GitHub.
- Else probe: `gh auth status` succeeds then GitHub; on failure, unknown (git-native only).

Find the base branch (the PR target, else the repo default):

- GitHub: `gh pr view --json baseRefName -q .baseRefName`, else `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`.
- Git-native fallback: `git symbolic-ref refs/remotes/origin/HEAD | sed 's|refs/remotes/origin/||'`, else try `origin/main`, then `origin/master`, then default to `main`.

Print the detected base branch. Substitute it for `<base>` everywhere below.

## Step 2: Pre-flight

1. `git branch --show-current`. If it equals `<base>` or the default branch, **abort**: "You're on the base branch. Ship from a feature branch."
2. `git status` (never `-uall`). Uncommitted changes are included. No need to ask.
3. Understand the changeset:
   ```bash
   git diff <base>...HEAD --stat
   git log <base>..HEAD --oneline
   ```
4. **Distribution pipeline check.** If the diff introduces a new standalone artifact (a CLI binary, library package, or tool — a `cmd/` directory, `main.go`, `bin/` entry point, or new package manifest), not a web service with existing deployment, verify a release pipeline exists (`ls .github/workflows/ | grep -iE 'release|publish|dist'`). New artifact with no release pipeline: ask in plain text whether to add a release workflow now, defer it, or declare it internal (existing deployment covers it); users cannot download the artifact after merge. Pipeline exists or no new artifact: continue silently.
5. If the diff is large (roughly 200+ lines), suggest once: "Large diff, consider running `code-review` before shipping." Do not block.

## Step 3: Merge the base branch (before tests)

Merge base into the feature branch so tests run against the merged state:

```bash
git fetch origin <base> && git merge origin/<base> --no-edit
```

- No remote configured (`git remote` returns nothing) then skip this step and note it.
- Simple conflicts (VERSION, CHANGELOG ordering) then resolve them. Lockfile conflicts: take either side whole, then regenerate with the package manager (`npm install` or the repo's equivalent). Never hand-merge a lockfile.
- Complex or ambiguous conflicts then **STOP** and show them. Let the user resolve.
- Already up to date then continue silently.

## Step 4: Run tests

Detect the test command from the repo and run it. First match wins:

- `package.json` with a `test` script then `npm test` (use `pnpm`/`yarn`/`bun` if that lockfile is present).
- `pytest.ini` / `pyproject.toml` / a `tests/` dir then `pytest`.
- `Cargo.toml` then `cargo test`.
- `go.mod` then `go test ./...`.
- `Makefile` with a `test` target then `make test`.
- None found then tell the user and ask, in plain text, which command to run. Do not invent one.

Paste the real tail of the test output as evidence.

- **Tests introduced by this branch fail:** **STOP**. Do not proceed. Fix, then re-run.
- **Pre-existing failures** (also failing on `<base>`): note them, continue.
- If you change any code after this run, re-run before preparing commands. "Should work" is not evidence.

## Step 5: Review the diff

Read the full diff and sanity-check it yourself. Step 2 ships uncommitted changes too, so read the working tree as well as the committed diff:

```bash
git diff <base>...HEAD
git diff
git diff --cached
git ls-files --others --exclude-standard   # untracked files ship as well: read their contents, not just their names
```

Look for debug leftovers (prints, commented-out blocks), stray files, secrets, and unrelated changes that crept in; the uncommitted and untracked files are exactly where those hide. Fix what is clearly wrong (these edits are reversible). Flag anything you are unsure about. Fixes you make during this review are themselves unreviewed: re-read your own fix hunks before preparing commands. For a deeper pass on a large or sensitive diff, suggest `code-review`.

## Step 6: Bump VERSION

Find the version source and bump it. Bump relative to the **base branch** version so parallel branches do not collide on the same number.

1. Locate the version, first that exists:
   - `VERSION` file at repo root.
   - `package.json` field `.version`.
   - Other manifests (`pyproject.toml`, `Cargo.toml`): bump by hand if that is the repo's source of truth, and note it.
   - No version source at all: skip this step and say so. Do not add versioning to a repo that does not use it.
2. Read the base version to avoid collisions, then bump from whichever of local and base is higher, comparing segment by segment numerically (10.0 beats 9.9. Never compare version strings lexically):
   ```bash
   git show origin/<base>:VERSION 2>/dev/null   # or read the base package.json version
   ```
3. Decide the level from the diff, then propose the bump in plain text and apply it only after the user confirms ("Proposing MINOR: 2.4.1 → 2.5.0 (new X). Confirm, or name another level."). Levels:
   - **PATCH:** bug fixes, small tweaks, config, refactors with no new surface.
   - **MINOR:** a new feature, route, module, or migration.
   - **MAJOR:** a breaking change or a deliberate milestone.
4. Preserve the existing format: segment count and any `v` prefix. Write the new version to the file(s) with Edit.
5. Sanity-check the number is free in the repo's own tag style: `git tag -l "<new>" "v<new>"` should return nothing.

## Step 7: Update CHANGELOG

If `CHANGELOG.md` exists (or the repo clearly keeps one under another name), add an entry following the file's existing style. If the repo has none, skip this step and note it. Do not impose one. When the file is empty or brand-new, use Keep a Changelog:

```markdown
## [<new-version>] - <YYYY-MM-DD>

### Added / Changed / Fixed
- <one line per notable change, derived from the commits and diff>
```

Group lines under Added, Changed, or Fixed as they apply. Keep entries concise and user-facing. Match the file's date convention. Do not fabricate a new one.

## Step 8: Prepare the commit, push, and PR commands

You have merged, tested, reviewed, and bumped. Now assemble the commands. Do NOT execute anything in this step: output the block for the user to run.

**Commit grouping:** for a small change (under roughly 50 lines, few files), one commit. For a larger changeset, group into logical, independently-valid commits ordered so dependencies come first (infra and migrations, then models and services, then controllers and UI), with VERSION plus CHANGELOG in the final commit. Each commit is one coherent change, good for `git bisect`.

**Message style:**

- Conventional commits, subject line only, descriptive (name what the change does): `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`, `perf:`, `ci:`.
- Add a body only when it carries real signal.

**PR content:** title is `<type>: <summary>`. Body states what changed and why, plus a short test plan.

Output the block below (filled in) for the user. Do NOT execute any of it yourself. Prefix it clearly:

> Run these to ship. Review the staged files and messages first. Nothing here has been executed.

GitHub:

```bash
# OUTPUT ONLY: do not execute; show this block to the user
git add <files for this commit>
git commit -m "<type>: <descriptive subject>"
# ...additional grouped commits as needed...
git push -u origin <branch>
gh pr create --base <base> --title "<type>: <summary>" --body "$(cat <<'EOF'
## Summary
- <what changed and why>

## Test plan
- [ ] <how it was verified; include the test result already produced above>
EOF
)"
```

If a PR already exists for this branch, output the update form instead (`gh pr edit`), not a second create. No remote configured: output only the grouped commit commands and omit the push and PR lines.

After the user ships, `deploy-watch` watches the live deploy and `document-release` updates any docs the release made stale.

## Important rules

- **Never run the commit, push, or PR-create commands yourself.** Prepare and output them. The user runs them. This is the skill's core contract.
- **Never force-push.** Output a plain push only.
- **Never skip tests.** If tests introduced by this branch fail, stop.
- **Preserve the repo's VERSION format and CHANGELOG conventions.** Do not impose new ones.
- **Stay inside the working repo.** Edit only VERSION and CHANGELOG (plus files you fixed during review). Write no state, metrics, or config files anywhere else.
- The goal: after this skill runs, the user has a green test result, a bumped VERSION, a written CHANGELOG entry, and a ready-to-paste commit, push, and PR block.
