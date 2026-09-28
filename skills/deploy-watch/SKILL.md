---
name: deploy-watch
description: After a release goes out, watch the live target for a bounded window to confirm it is healthy before walking away. Returns a verdict (healthy, degraded, or rollback-recommended) with evidence, plus the exact rollback commands on failure, never run.
allowed-tools: Bash, Read, Write, Grep
origin: gstack
---

Be the safety net between "shipped" and "verified." A deploy can pass CI and still break in production: a missing environment variable, a CDN serving stale assets, a migration that is slower on real data.

Your job is to catch that in the first few minutes by watching the live target, not to trust the green build. Observe, compare, and return a clear verdict with evidence.

**Safety rule (non-negotiable):** this skill never executes a rollback, redeploy, promote, or any deploy-state mutation. It watches (read-only probes, log reads, local test runs) and, when a rollback is warranted, OUTPUTS the exact commands for the user to run by hand. The terminal action on production is always the user's.

## Inputs

Two things, detected from the conversation if possible, otherwise asked as plain-text questions (do not block on formatting):

1. **Target:** the deployed URL or service to watch (and the specific paths, if known).
2. **What changed:** the gist of the deploy, so you know which paths and log signatures to watch closely.

If neither is recoverable from context, ask: "What is the deployed URL or service to watch, and what did this deploy change?" Then proceed.

## Step 1: Set the watch window

Pick a bounded window and a check interval. Defaults: 10 minutes total, one check every 60 seconds. Honor an explicit request in the range 1 to 30 minutes. State the window you chose.

The window is a hard deadline: when it elapses you stop and report. There is no background daemon and no open-ended watch.

Decide the paths to watch. Use paths named in the inputs, else the homepage plus any obvious critical routes (login, dashboard, an API health route). Keep it to a handful.

## Step 2: Baseline (optional, strongest before the deploy)

A deploy-watch compares against a reference. The best reference is a baseline captured on the old version before deploying. Without one, the deploy-watch falls back to absolute checks (expect 2xx, expect smoke tests green).

If invoked before the deploy to capture a baseline, run the Step 3 probes once against the current live version and keep the results (status, latency, error-log rate, smoke outcome) as the reference. Then tell the user: "Baseline captured. Deploy, then run deploy-watch against the same target to watch."

If invoked after the deploy with no baseline, note that you are running absolute checks and continue.

## Step 3: Define the checks

Use every probe the environment supports. Skip the rest. The first two are universal.

1. **Health and latency (curl, always available).** One probe per path, expecting a 2xx or an intended redirect and a latency near the baseline:
   ```bash
   curl -sS -o /dev/null -w "status=%{http_code} time=%{time_total}s size=%{size_download}\n" --max-time 15 "$URL"
   ```

2. **Critical-path smoke tests.** Re-run the repo's fast critical-path checks if it has them: a `smoke` script (`npm run smoke`), a tagged e2e subset (`npm run test:e2e -- --grep @smoke`, `pytest -m smoke`), or a `smoke/` script. If none exist, curl each critical route and assert a 2xx plus a sentinel string in the body (a known element, an API field). Do not run the full test suite. The deploy-watch wants a fast signal.

3. **Deploy logs (platform CLI, where available).** Read recent logs with a **bounded, one-shot** command and scan for an error spike: grep the output for `error`, `exception`, `panic`, `traceback`, ` 5[0-9][0-9] `, count matches, and compare the rate to the baseline (or to zero if none). Never the streaming or follow forms (`-f`, `--tail`, plain `fly logs`): those are unbounded daemons.
   ```bash
   vercel logs "$URL" --since 2m            # Vercel
   fly logs --no-tail | tail -n 200         # Fly
   heroku logs -n 200                       # Heroku (not --tail)
   docker logs --since 2m <container>       # Docker
   kubectl logs --since=2m --tail=200 deploy/<name>   # Kubernetes
   ```

4. **Browser checks (where a browser automation capability is available).** If the environment exposes a browser MCP (Playwright or Chrome DevTools, for example), load each path and collect console errors, failed network requests, and a screenshot as evidence. Treat this as optional enrichment. The curl and log probes carry the verdict when no browser is available.

## Step 4: Watch loop (bounded)

Run the health probe on every path once per interval until the deadline. A single scripted loop is the simple default:

```bash
URL="https://your-deploy-target"   # repeat the block per path, or loop over a list
DURATION=600                        # total window in seconds (60-1800)
INTERVAL=60                         # seconds between checks
DEADLINE=$(( $(date +%s) + DURATION ))
check=0
while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  check=$((check + 1))
  ts=$(date -u +%H:%M:%S)
  result=$(curl -sS -o /dev/null -w "status=%{http_code} time=%{time_total}s" --max-time 15 "$URL" 2>&1)
  echo "check $check @ ${ts}Z: $result"
  [ "$(date +%s)" -ge "$DEADLINE" ] && break
  sleep "$INTERVAL"
done
```

Run the heavier probes (smoke tests, log scan, browser) at the first and last check, and again on any check where the health probe looks off. For a long window you may instead drive the checks one per turn, provided you still stop at the hard deadline.

**Alerting rules:**

- Alert on **change, not absolutes.** A path that had 3 console errors in the baseline is fine at 3. One new error is an alert. Judge against the baseline (or against 2xx/green when there is none).
- **Do not cry wolf.** Only raise an alert on a problem that persists across 2 or more consecutive checks. A single transient blip (one timeout, one 502 that clears) is noted, not alerted.
- Severity by tier:
  - **critical:** page unreachable or 5xx that persists.
  - **high:** new persistent console or log errors, or a broken critical route.
  - **medium:** latency past ~2x baseline.
  - **low:** a new 404 on a non-critical link.

When an alert fires, state it in prose and keep watching (watching is reversible, so do not stop the window for a single finding):

```
CANARY ALERT — check N @ HH:MMZ
Path:     <path>
Severity: <critical | high | medium | low>
Finding:  <what changed, specifically>
Baseline: <reference value>   Current: <observed value>
Evidence: <log excerpt, screenshot path, or curl output>
```

The one exception: a persistent **critical** finding (target down or 5xx across 2+ checks) is a rollback signal. Finish the current check, then go to Step 6 rather than waiting out the window.

## Step 5: Verdict and report

When the window closes (or a critical finding cuts it short), print the report and a verdict. Verdict values:

- **HEALTHY:** no persistent alert; health, smoke, and logs at or better than baseline.
- **DEGRADED:** persistent medium or high findings, but the target is up and serving. Worth a look. Not an automatic rollback.
- **ROLLBACK RECOMMENDED:** a persistent critical finding, or high findings severe enough that users are broadly affected.

```
CANARY REPORT — <target>
Window:   <N> min, <M> checks, one every <interval>s
Verdict:  <HEALTHY | DEGRADED | ROLLBACK RECOMMENDED>

Per path:
  <path>          <status>   <errors vs baseline>   <avg latency (baseline)>
  ...

Alerts:   <count> (<critical>/<high>/<medium>/<low>)
Evidence: <log excerpts, screenshot paths, smoke output tails>
```

The report is the deliverable. Print it. If the user wants a durable record, save it to a repo-local path they choose (for example `deploy-watch-report.md`). Write nothing outside the working repo.

When the verdict is HEALTHY, `document-release` records what shipped.

## Step 6: Rollback recommendation (only on ROLLBACK RECOMMENDED)

Do NOT roll back yourself. State plainly why rollback is warranted (the persistent critical finding and its evidence), then output the exact commands for the user, matched to the platform you detected. Do NOT execute any of it yourself.

```bash
# OUTPUT ONLY: do not execute; show this block to the user
# Vercel: promote the previous production deployment
vercel rollback <previous-deployment-url>
# Fly: roll back to the prior release
fly releases            # find the prior version
fly deploy --image <previous-image-ref>
# Heroku: roll back to the prior release
heroku releases         # find the prior vNNN
heroku rollback vNNN
# Kubernetes: undo the last rollout
kubectl rollout undo deployment/<name>
# Git-based deploy: revert the deploy commit, then redeploy your usual way
git revert --no-edit <deploy-commit-sha>
```

Keep only the lines for the actual platform. Drop the rest. Then hand off to `diagnosing-bugs` to find why the deploy broke.

## Important rules

- **Read-only on production.** Probe, read logs, run local smoke tests. Never mutate deploy state. Rollback is a recommendation plus an output block, never an action.
- **Bounded, no daemon.** Every watch has a hard deadline and a fixed interval. Never leave a streaming log follower or background loop running.
- **Alert on change, tolerate transients.** Compare to the baseline. Require a problem to persist across 2+ checks before alerting.
- **Evidence with every alert.** A log excerpt, a curl result, or a screenshot path. No bare assertions.
- **A baseline captured before the deploy makes the deploy-watch far sharper.** Encourage it. Without one, fall back to absolute health checks and say so.
- **Stay inside the working repo.** Write no state, metrics, or files anywhere outside it. An optional report goes to a repo-local path the user picks.
