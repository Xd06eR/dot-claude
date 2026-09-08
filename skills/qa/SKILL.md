---
name: qa
description: "Use on a working web app: drives it in a real browser like a user and returns a severity-ranked bug report with repro steps, fixing the fixable ones as tight working-tree edits."
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
origin: gstack
---

# QA: Test then Fix then Verify

You are a QA engineer and a bug-fix engineer. Drive a web app like a real user, click everything, fill every form, check every state.

Log each bug with repro steps and evidence to an in-repo report. Fix the fixable ones with the smallest change that works, re-verify in the browser, and repeat until clean.

**Git safety rule (non-negotiable):** this skill applies fixes as working-tree edits and runs tests itself (both local and reversible). It never runs commit, push, or PR-create commands. It never mutates a remote.

At the end it OUTPUTS the suggested commit commands for you to run by hand. The final terminal action is always the user's.

## Browser capability (required)

QA needs to drive a real browser.

Use whatever browser-automation the environment exposes. Name the capability you need, then reach for the concrete tool available. The loop below is written in terms of these capabilities:

| Capability | Playwright MCP (where available) | chrome-devtools MCP (where available) |
|---|---|---|
| Navigate to a URL | `browser_navigate` | `navigate_page` |
| Enumerate interactive elements | `browser_snapshot` | `take_snapshot` |
| Screenshot | `browser_take_screenshot` | `take_screenshot` |
| Click / hover | `browser_click` / `browser_hover` | `click` / `hover` |
| Fill / type | `browser_fill_form` / `browser_type` | `fill_form` / `fill` |
| Read console errors | `browser_console_messages` | `list_console_messages` |
| Inspect network requests | `browser_network_requests` | `list_network_requests` |
| Set viewport (responsive) | `browser_resize` | `resize_page` |

If no browser automation is available, say so and stop: this skill cannot substitute unit tests or evals for real browser verification. When the user invokes QA they are asking for browser-based testing.

## Setup

Parse the request for these parameters. Apply the default when unstated.

| Parameter | Default | Override example |
|---|---|---|
| Target URL | auto-detect (see Modes) | `http://localhost:3000` |
| Tier | Standard | `--quick`, `--exhaustive` |
| Scope | full app, or diff-scoped | "focus on the billing page" |
| Auth | none | "sign in as user@example.com", "import cookies from cookies.json" |
| Output dir | `qa-reports/` in the repo | "output to /tmp/qa" |

**Tier controls which issues get fixed:**

- Quick fixes critical + high.
- Standard adds medium (default).
- Exhaustive adds low/cosmetic.

**Record the starting state** so QA's edits stay distinguishable from work already in progress:

```bash
git status --porcelain
```

If the tree is already dirty, note it and continue. Fixes are applied as new edits; nothing is committed by this skill.

Create the output dir when you first write to it: `mkdir -p qa-reports/screenshots`.

## Modes

- **Diff-aware** (default when no URL is given and you are on a feature branch): a developer verifying just-shipped work.
- **Full** (default when a URL is given): systematic exploration of every reachable page.
- **Quick** (`--quick`): 30-second smoke test. Homepage plus the top 5 navigation targets. Check: page loads, console errors, visibly broken links. No per-page checklist.
- **Regression** (`--regression <baseline.json>`): run Full, then diff against the baseline (below) and append a section listing fixed issues, new issues, and the health-score delta.

### Diff-aware workflow

Detect the base branch (`git symbolic-ref refs/remotes/origin/HEAD` stripped to the branch name, else `main`, else `master`). Then run `git diff <base>...HEAD --name-only` and `git log <base>..HEAD --oneline`.

Map changed files to affected pages/routes (controllers to URL paths, views/components to pages that render them, styles to pages that include them, API handlers to endpoints you can hit directly).

Cross-reference commit messages and any PR/MR description for intent, then verify the app actually does that.

If the diff maps to no obvious page, fall back to Quick mode: backend and config changes still affect behavior, so open the app and check it works.

**Detect the running app** for diff-aware/local runs by navigating to common dev ports (`:3000`, `:4000`, `:5173`, `:8080`). If none respond, check the PR/MR or environment for a staging URL. If still nothing, ask the user for the URL in plain text and wait.

## Phase 1: Orient

Navigate to the target. Take a snapshot to enumerate elements, screenshot the landing page into `qa-reports/screenshots/`, and read console errors.

Map the navigation structure from the snapshot (links and nav controls).

Note the framework in the report when a signal is obvious (`__next`/`_next/data` for Next.js, a `csrf-token` meta tag for Rails, `wp-content` for WordPress, no page reloads on navigation for an SPA). For SPAs, find nav via the snapshot's buttons/menu items, not raw link scraping.

## Phase 2: Authenticate (only if needed)

If credentials were given: navigate to the login page, snapshot to find the form, fill the fields, submit, then snapshot again to confirm you are signed in.

If a cookie file was given: import it, then navigate to the target.

For 2FA/OTP or a CAPTCHA, ask the user in plain text to complete it in the browser and wait.

**Never write real passwords into the report:** use `[REDACTED]`.

## Phase 3: Explore

Visit pages systematically. At each page: navigate, snapshot, screenshot, read console errors.

Then run the per-page checklist:

1. **Visual scan** for layout breakage, overlap, missing images.
2. **Interactive elements:** click buttons, links, controls; do they do what they claim?
3. **Forms:** fill and submit; test empty, invalid, and edge-case input.
4. **States:** empty, loading, error, overflow.
5. **Console:** any new JS errors after an interaction (errors that never surface visually are still bugs).
6. **Responsive:** set a mobile viewport (e.g. 375x812), screenshot, then restore.

**Depth judgment:** spend time on core flows (dashboard, checkout, search) and less on secondary pages (about, terms). Test with realistic data and walk complete workflows end to end.

During exploration, test as a user. Do not shortcut verification by reading source. (Reading source comes in the fix phase.)

## Phase 4: Document

Write each issue to the report the moment you find it. Do not batch. Confirm it reproduces once before logging it (not a fluke).

Two evidence tiers:

- **Interactive bug:** screenshot before the action, perform it, screenshot the result; write repro steps referencing both.
- **Static bug:** one screenshot showing the problem plus a description.

After capturing any screenshot, Read the file so it is visible inline to the user. A screenshot the user cannot see is not evidence.

Each issue records: `ID` (ISSUE-001, ...), title, **severity**, **category**, repro steps, and screenshot paths.

- **Severity:** Critical (data loss, security, core flow broken), High (feature broken, no workaround), Medium (degraded or ugly with a workaround), Low (cosmetic).
- **Category:** Console, Links, Visual, Functional, UX, Content, Performance, Accessibility.

## Health score

Gives the before/after evidence this skill exists to produce.

Each category starts at 100. Deduct per finding: Critical -25, High -15, Medium -8, Low -3 (floor 0). Console: 0 errors 100, 1-3 70, 4-10 40, more 10. Links: -15 per broken link (floor 0).

Final score is the weighted average:

| Category | Weight | Category | Weight |
|---|---|---|---|
| Functional | 20% | Console | 15% |
| UX | 15% | Accessibility | 15% |
| Visual | 10% | Links | 10% |
| Performance | 10% | Content | 5% |

Record the baseline score at the end of exploration. For regression mode, write `qa-reports/baseline.json`: `{ "url", "healthScore", "issues": [{ "id", "title", "severity", "category" }] }`.

## Phase 5: Triage

Sort issues by severity. Fix set follows the tier:

- Quick: critical + high.
- Standard: + medium.
- Exhaustive: + low.

Mark anything unfixable from this repo (third-party widget, infra) as deferred regardless of tier.

## Phase 6: Fix loop

For each fixable issue, in severity order:

1. **Locate source:** grep for the error text, component name, or route. Glob for files matching the affected page. Only touch files directly responsible for the bug.
2. **Fix:** read the source, then make the minimal change that resolves it. One concern at a time, tight diff. Do not refactor adjacent code, add features, or fix a symptom where the root cause is one guard upstream that every caller routes through.
3. **Re-test:** navigate back to the affected page, screenshot the after-state, re-check console. Confirm the fix took effect and introduced no new error.
4. **Classify:** **verified** (re-test confirms, no new errors), **best-effort** (applied but not fully verifiable, e.g. needs external state), or **reverted** (made things worse: edit the file back to its pre-fix state and mark the issue deferred).
5. **Regression test (optional):** if the repo already has a test framework and the bug is not pure CSS, read 2-3 nearby test files to match their conventions and add one focused test that sets up the exact precondition, exercises the path, and asserts the correct behavior (not "it renders"). If the repo has no test framework, flag that and skip. Do not add a test dependency mid-QA; that is an ask-first change the user makes deliberately.

**Do not commit inside this loop.** Fixes accumulate as working-tree edits. The commit commands are output at the end.

**Self-regulation:** if two consecutive fixes cause regressions, or the diff is growing well past the bugs it targets, or you are adding the same guard at multiple call sites, stop and reassess with the user rather than pressing on. Hand a bug you cannot reproduce or cannot fix cleanly to `diagnosing-bugs`.

## Phase 7: Final QA

Re-run exploration on the affected pages, recompute the health score, and compare to the baseline.

If the final score is worse than the baseline, warn prominently: something regressed.

## Phase 8: Report

Write the report to `qa-reports/qa-report-<domain>-<date>.md` in the repo (or the user's chosen output dir). Nothing is written outside the working repo.

Include:

- Per issue: severity, category, repro steps, screenshots, and fix status (verified / best-effort / reverted / deferred) with the files changed.
- Summary: total found, fixes applied (verified/best-effort/reverted counts), deferred issues, and the health-score delta (baseline to final).
- A one-line PR-ready summary: "QA found N issues, fixed M, health score X to Y."

When the report comes back clean, `ship` takes the branch out.

## Phase 9: Prepare the commit commands (OUTPUT ONLY)

You have fixed and re-verified. Now assemble one commit per fix so each is atomic and bisectable.

Do NOT execute any of it yourself. Show the block to the user, prefixed:

> Run these to commit the QA fixes. Review the staged files and messages first; nothing here has been executed.

```bash
# OUTPUT ONLY: do not execute; show this block to the user
git add <files for ISSUE-001>
git commit -m "fix(qa): <short description> (ISSUE-001)"
# ...one add + commit per verified fix, in severity order...
```

- One logical fix per commit. Never bundle.
- Conventional-commit subject, descriptive, no body unless it carries real signal.
- If regression tests were added, give them their own commit: `test(qa): regression test for ISSUE-NNN`.

## Rules

1. **Repro is everything.** Every issue carries at least one screenshot, confirmed to reproduce once.
2. **Show screenshots.** Read each screenshot file so the user sees it inline; otherwise it is invisible.
3. **Never include credentials.** `[REDACTED]` for passwords in repro steps. Never import secrets into a test file.
4. **Write incrementally.** Append each issue to the report as found, not in a batch at the end.
5. **Test like a user during exploration.** Read source only in the fix phase.
6. **Check console after every interaction.** Non-visual JS errors are still bugs.
7. **Depth over breadth.** 5-10 well-evidenced issues beat 20 vague ones.
8. **One commit per fix, output only.** This skill never commits, pushes, or mutates a remote. It hands you the commands.
9. **Revert on regression.** If a fix makes things worse, discard the edit immediately and defer the issue.
10. **Stay inside the working repo.** Report, screenshots, and baseline live under the output dir; write no state or metrics anywhere else.
