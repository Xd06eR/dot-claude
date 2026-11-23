#!/bin/bash
# PreToolUse(Agent) guardrail: every subagent dispatch must go through the
# dispatch-protocol skill first; the protocol carries the dispatch contract
# (goal, acceptance criteria, report format, artifact clause).
# Scans the session transcript, via transcript_path in the hook input, since
# the last top-level type=user entry for a Skill(dispatch-protocol) tool_use.
# Missing -> block with feedback so the model invokes the skill and retries.
# The horizon keys on the top-level type field, never role: echo entries
# (api-request*, last-prompt, attachment, tool_result, empty harness entries)
# also carry top-level type=user and must not reset it; only user messages
# carrying a text block or the compact-summary flag set boundaries. Compact
# summaries land as type=user entries, so /compact resets the horizon where
# loaded context was dropped. All patterns tolerate
# optional serialization spaces ("type": "user").
# Greps raw JSON: no jq/sed (embedded quotes truncate captures). The invoke
# match needs tool name and skill name on one transcript line, so a
# prompt-mention of the protocol does not pass.
# Residuals, accepted: form not content (an unread invoke still passes),
# fail-open when the transcript is unreadable, one subprocess per Agent call,
# per-turn freshness (each new user message resets the horizon).
INPUT=$(cat)
TRANSCRIPT=$(echo "$INPUT" | grep -oE '"transcript_path": ?"[^"]*"' | head -1 | cut -d'"' -f4 | tr -s '\\' | tr '\\' '/')
if [ -z "$TRANSCRIPT" ] || [ ! -f "$TRANSCRIPT" ]; then
  echo "NOTE: dispatch-protocol gate skipped (transcript unavailable)." >&2
  exit 0
fi
LASTUSER=$(grep -nE '"type": ?"user"' "$TRANSCRIPT" | grep -vE '"type": ?"(api-request|api-request-blob|api-request-shape|last-prompt|attachment)"' | grep -vE '"type": ?"tool_result"' | grep -E 'isCompactSummary": ?true|"type": ?"text"' | tail -1 | cut -d: -f1)
if [ -z "$LASTUSER" ]; then
  LASTUSER=1
fi
if tail -n +"$LASTUSER" "$TRANSCRIPT" | grep -qE '"name": ?"Skill".*"skill": ?"dispatch-protocol"'; then
  exit 0
fi
echo "BLOCKED: invoke the dispatch-protocol skill before dispatching a subagent, then retry." >&2
exit 2
