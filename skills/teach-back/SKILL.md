---
name: teach-back
description: Verify the user deeply understands a session's work by having them teach it back. Probe first, fill gaps, then quiz against a checklist of the problem, solution, and broader context, advancing on mastery and marking unmastered items incomplete.
disable-model-invocation: true
origin: custom
---

Make sure the user deeply understands this session before it closes: quiz until they can teach it back.

## Scope

First, get clear on what "this session" covers — the whole conversation, the last feature, or one specific change. If it's ambiguous, ask. Quiz only on that scope.

## Method

Do this incrementally, with each step, instead of all at once at the end. Before moving on to the next stage, confirm the user has mastered everything in the current one. Do this at both a high level and a low level:

- **High level** — e.g. motivation, why it matters, the broader impact.
- **Low level** — e.g. business logic, design decisions, edge cases.

Keep a running markdown doc with a checklist of things the user should understand. Make sure they understand:

1. **The problem** — what it was, why the problem existed, the different branches.
2. **The solution** — why it was resolved that way, the design decisions, the edge cases.
3. **The broader context** — why this matters, and what the changes will impact.

Make sure they understand *why* — and drill down into more whys. Make sure they understand *what* and *how* as well. Understanding the problem well is imperative.

## Loop

1. **Probe first.** To get a sense of where the user is at, proactively have them restate their understanding before you explain anything. Then help them fill in the gaps from there.
2. **Fill gaps.** They might ask you questions, or ask you to eli5, eli14, or elii (explain like they're an intern). Match the depth they ask for.
3. **Quiz.** Quiz them with open-ended or multiple-choice questions — use a structured picker if your harness has one (e.g. `AskUserQuestion` in Claude Code), otherwise just ask in chat. For multiple-choice, change up the order of the correct answer. The options can seed ideas, and an "other" choice lets them answer in their own words. On the core "why" questions, ask open-ended first — you want the user to recall the answer, not just recognize it among the options. Lean on options mainly to unstick someone who's gone blank. Don't reveal the answer until after the questions are submitted.
4. **Show, don't tell.** Show them real code, or have them use the debugger, if it helps the point land.
5. **Confirm, then advance.** Only move on to the next checklist item once the current one is mastered. When the user gets something wrong or shaky, don't just move on — find the misconception ("what made you pick that?"), clear it up with one concrete example, then re-quiz the same point. Cap it at two retries. If it's still not landing, mark that item incomplete and move on.

## Success criteria

**Goal:** the session should not end until you've verified that the user has demonstrated they understood everything on your list — though the user can stop whenever they want. If they ask to stop, defer, or are stuck, respect it: mark the remaining items incomplete and note them for a future session.

Enforce this gate yourself in the loop: do not treat the session as done until every checklist item is confirmed or the user has chosen to stop.
