---
name: land-and-deploy
description: "Ship phase for landing and deploying a finished, reviewed, green branch: merge it to the base branch, deploy to whatever the repo already configures (CI-on-merge, or a platform CLI or deploy script run after your plain-text go-ahead), then verify the release is healthy with HTTP and smoke checks before walking away. Gates the irreversible merge behind a readiness check and hands the merge, push, and any revert back as commands you run. After it lands, chain `deploy-watch` for the post-deploy monitoring window and `document-release` to record what shipped; on a failed verify, hand off to `diagnose`."
allowed-tools:
  - Bash
  - Read
  - Grep
---

# Land and Deploy

Pick up where `ship` left off: `ship` prepared the branch and the PR/MR, this takes it live. Merge it to the base branch (the "land"), deploy to the target the repo already configures, then verify the deploy is healthy before you walk away.

**Git safety rule (non-negotiable):** this skill never merges, pushes, tags, or creates/merges a PR/MR against a remote itself, and never runs a force or destructive variant of anything. Every git or PR mutation is handed back as a command block the user runs. Running a deploy (a platform CLI or the repo's own deploy script) is this skill's actual job and is allowed, but only after a plain-text go-ahead from the user in this session, and never a force or destructive form. Read-only checks and post-deploy verification (status polls, `curl` health, smoke checks) run freely.

Run straight through without asking for trivial confirmations. Stop only for: no PR/MR found, CI failing, merge conflicts, the pre-merge go-ahead, the deploy go-ahead, or a failed verify.

## Step 1: Detect platform and base branch

Detect the host from the remote, then the branch this work targets.

```bash
git remote get-url origin 2>/dev/null
```

- URL contains `github.com` then GitHub. Contains `gitlab` then GitLab.
- Else probe: `gh auth status` succeeds then GitHub; `glab auth status` succeeds then GitLab; neither then unknown (git-native only).

Find the base branch (the PR/MR target, else the repo default):

- GitHub: `gh pr view --json baseRefName -q .baseRefName`, else `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`.
- GitLab: `glab mr view -F json` field `.target_branch`, else `glab repo view -F json` field `.default_branch`.
- Git-native fallback: `git symbolic-ref refs/remotes/origin/HEAD | sed 's|refs/remotes/origin/||'`, else try `origin/main`, then `origin/master`, then default to `main`.

Print the detected base branch. Substitute it for `<base>` everywhere below.

## Step 2: Pre-flight — find the PR/MR

Arguments (optional): a PR/MR number (`#123`) picks that one; a URL is saved for the verify step.

1. Confirm the host CLI is authenticated (`gh auth status`, or `glab auth status`). Not authenticated, and no number/URL given: tell the user which login command to run, then stop.
2. Find the PR/MR for the current branch:
   - GitHub: `gh pr view --json number,state,title,url,mergeStateStatus,mergeable,baseRefName,headRefName`
   - GitLab: `glab mr view -F json`
3. Validate its state:
   - None found: **stop.** "No PR/MR for this branch. Run `ship` first, then come back to land it."
   - `MERGED`: already landed. Skip Steps 3 and 4, go to Step 5 to deploy and verify.
   - `CLOSED`: **stop.** "This was closed without merging. Reopen it, then retry."
   - `OPEN`: continue.
4. Tell the user what you found: "Found #NNN — '{title}' ({head} to {base})."

## Step 3: Readiness gate (before the irreversible merge)

The merge cannot be undone without a revert, so confirm the branch is actually ready.

1. **CI status** (read-only):
   - GitHub: `gh pr checks`. Any required check failing: **stop** and list them ("Fix CI before landing."). Pending: tell the user, then either wait (poll `gh pr checks --watch`, roughly a 15 min cap) or continue if they say so.
   - GitLab: `glab ci status` for the MR's pipeline.
   - No CI configured: run the repo's test suite yourself as the stand-in. Detect the command the way `ship` does (first match wins: `npm test` with the matching package manager, else `pytest`, `cargo test`, `go test ./...`, `make test`); ask in plain text if none is detectable. Paste the tail as evidence. Tests introduced by this branch failing: **stop.**
2. **Merge conflicts** (read-only): GitHub `gh pr view --json mergeable -q .mergeable`; `CONFLICTING`: **stop.** "Resolve conflicts against `<base>` and push, then retry."
3. **Large or unreviewed diff:** if the diff is large (roughly 200+ lines), suggest once, non-blocking: "Large diff, consider `code-review` before landing."
4. **Go-ahead (blocking, plain text):** summarize the state (CI, conflicts, diff size), then ask: "Ready to land #NNN into `<base>`? This merge is irreversible without a revert. Reply `go` to proceed." Wait for an explicit `go`; treat silence or a vague reply as not-yet.

## Step 4: Land — output the merge command, then confirm it landed

You do not run the merge. Output the command block for the user, then detect when it lands. Do NOT execute any of it yourself. Prefix it:

> Run this to land the PR/MR. Nothing here has been executed.

GitHub:

```bash
# OUTPUT ONLY: do not execute; show this block to the user
gh pr merge <number-or-branch> --squash --delete-branch
```

GitLab:

```bash
# OUTPUT ONLY: do not execute; show this block to the user
glab mr merge <iid> --remove-source-branch
```

Git-native (no host CLI), plain merge only, never a force variant:

```bash
# OUTPUT ONLY: do not execute; show this block to the user
git fetch origin && git checkout <base> && git merge --no-ff <branch> && git push origin <base>
```

Then confirm the landing without mutating anything:

- Poll PR/MR state read-only until it reports `MERGED` (GitHub `gh pr view --json state,mergeCommit -q .state`; GitLab `glab mr view`). This naturally covers merge queues (state stays open until the queue clears) and concurrent merges. Poll roughly every 30s, cap around 30 min.
- Capture the merge commit SHA (`gh pr view --json mergeCommit -q .mergeCommit.oid`). You need it for the deploy watch and any revert.
- Timeout or no host CLI: ask the user in plain text to confirm the merge landed and to paste the merge SHA.

Do not proceed to deploy until the merge is confirmed.

## Step 5: Detect the deploy target

Read what the repo already configures. The point is to tell "the merge itself deploys" apart from "someone has to run a deploy."

```bash
# Platform config files
for f in fly.toml render.yaml vercel.json netlify.toml Procfile railway.json railway.toml app.yaml; do
  [ -f "$f" ] && echo "PLATFORM_FILE: $f"
done
[ -d .vercel ] && echo "PLATFORM_FILE: .vercel"

# Deploy scripts
grep -iE '"deploy"|"release"' package.json 2>/dev/null
grep -iE '^deploy:|^release:' Makefile 2>/dev/null

# CI deploy jobs (evidence the merge auto-deploys)
for f in $(find .github/workflows -maxdepth 1 \( -name '*.yml' -o -name '*.yaml' \) 2>/dev/null); do
  grep -qiE 'deploy|release|production' "$f" && echo "DEPLOY_WORKFLOW: $f"
  grep -qiE 'staging|preview' "$f" && echo "STAGING_WORKFLOW: $f"
done
```

Also read an optional `## Deploy Configuration` block in `CLAUDE.md` (platform, production URL, staging URL, a custom deploy or health command) and a production URL passed as an argument. These are hints, not requirements.

Classify into one of three branches for Step 6:

- **Auto-deploy on merge**: a CI deploy workflow, or Vercel/Netlify with git integration, or Render on push to `<base>`. The merge already triggered it. You WATCH, you do not run anything.
- **Manual deploy**: a platform CLI (`fly deploy`, `vercel deploy`) or a deploy script (`npm run deploy`, `make deploy`) with no CI wiring. Someone has to run it.
- **Nothing to deploy**: a library, a CLI tool, or a docs-only change (`git diff <base> --name-only` touches only docs). Tell the user and skip to Step 8.

If you cannot tell which, ask in plain text with the evidence you found.

## Step 6: Deploy

### Branch A — auto-deploy on merge (watch, do not run)

The merge triggered the deploy. Watch it, read-only:

- CI workflow: find the run for the merge SHA, then follow it.
  ```bash
  gh run list --branch <base> --limit 10 --json databaseId,headSha,status,conclusion,workflowName
  gh run watch <run-id>    # or poll: gh run view <run-id> --json status,conclusion
  ```
- Vercel/Netlify/Render with no CI run to watch: wait roughly 60s for propagation, then rely on the verify step.
- Deploy workflow fails: show the failing job and offer the revert block (Step 8) or `diagnose`. Do not retry blindly.

### Branch B — manual deploy (run only after a plain-text go-ahead)

Show the exact command you detected, then ask: "Deploy `<app>` to production with `fly deploy`? Reply `go`." On `go`, run it (never a force or destructive flag):

```bash
fly deploy        # or: vercel deploy --prod, npm run deploy, make deploy — whatever the repo defines
```

Stream the result. Nonzero exit: show the output and offer the revert block (Step 8) or `diagnose`. Do not add `--force` and do not delete anything.

**Staging first (optional):** if Step 5 found a staging target (a staging workflow, a preview deploy, or a staging URL) and the change includes code, offer in plain text to deploy and verify staging first, then production. Default to production if the user does not ask for staging.

## Step 7: Verify the deploy is healthy

Single-pass check that the release is actually up. (`deploy-watch` owns the extended monitoring loop.)

You need a URL: use the argument, the `CLAUDE.md` production URL, or ask. No URL and not a web service: note "deployed, not verified" and go to Step 8.

- **HTTP health (always available, cross-platform):**
  ```bash
  curl -sS -o /dev/null -w '%{http_code}' <url>
  ```
  Expect a 2xx or 3xx. Repeat once or twice a few seconds apart to ride out cold starts. Fetch the body once too and confirm it is not empty and not an error page.
- **Browser checks (where a browser automation tool is available, for example a chrome-devtools or playwright MCP):** load the URL, check the console for errors (`Uncaught`, `TypeError`, `Failed to load`), and confirm real content rendered. Skip cleanly if no such tool is present.

Healthy: tell the user what you observed (status, load, no console errors), then go to Step 8.
Unhealthy: show the evidence and ask whether to revert (Step 8), investigate with `diagnose`, or treat it as warm-up and accept. Never revert without an explicit answer.

## Step 8: Revert (escape hatch, output only)

If the user asks to roll back at any point, hand them the revert; do NOT run it (it pushes to `<base>`). Do NOT execute any of it yourself.

```bash
# OUTPUT ONLY: do not execute; show this block to the user
git fetch origin <base> && git checkout <base>
git revert <merge-sha> --no-edit
git push origin <base>
```

If `<base>` is push-protected, output a revert-PR form instead (push the revert to a new branch, then open a PR titled `revert: <title>`), never a force push. Once it deploys, the previous version is restored.

## Step 9: Report and follow-ups

Print (do not write a file) a compact summary: PR/MR number and title, merge SHA, deploy path (auto / manual / none), and verify verdict (healthy / deployed-unverified / reverted).

Then chain the natural next step:

- Verified live: "Run `deploy-watch <url>` to watch it through the stabilization window."
- Merged but unverified: "Check it manually, or run `deploy-watch <url>` once you have the URL."
- Shipped something notable: "Run `document-release` to sync README, CHANGELOG, and docs with what landed."
- Verify failed or reverted: "Run `diagnose` to find the root cause before re-shipping."

## Important rules

- **Never merge, push, tag, or create/merge a PR/MR against a remote yourself.** Output those as command blocks; the user runs them. Never a force or destructive variant.
- **Deploy execution is allowed, but only after a plain-text go-ahead**, and never a force or destructive deploy. Watching an auto-deploy needs no go-ahead (it is read-only).
- **Verification is single-pass.** `deploy-watch` owns the monitoring loop.
- **Auto-detect everything** (PR, base branch, platform, deploy path, staging). Ask only when it genuinely cannot be inferred.
- **Poll read-only, with sane intervals and caps** (roughly 30s, minutes not hours). Do not hammer the API.
- **Stay inside the working repo.** Write no state, metrics, or report files anywhere; print the report instead.
