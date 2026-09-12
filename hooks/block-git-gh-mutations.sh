#!/bin/bash
# PreToolUse(Bash) guardrail: block dangerous git/gh mutations by accident.
# The user runs all git/gh mutations manually (CLAUDE.md Git section).
# Greps the raw hook JSON directly: no jq/sed (an embedded quote would
# truncate a sed capture and hide a dangerous tail).
# Patterns are word-anchored: near-misses like "gitcommittee" never block.
# String literals inside a command match too (echo "git push") — rare, accepted.
# Accident guardrail, not a security boundary.
INPUT=$(cat)
DANGEROUS_PATTERNS=(
  '\bgit([[:space:]]+(-[cC][[:space:]]+\S+|--\S+=\S+))*[[:space:]]+(commit|push)\b'
  '\bpush[[:space:]]+(-f\b|--force)'
  '\bgit[[:space:]]+reset[[:space:]]+--hard\b'
  '\bgit[[:space:]]+clean[[:space:]]+-[a-zA-Z]*f'
  '\bgit[[:space:]]+branch[[:space:]]+-D\b'
  '\bgit[[:space:]]+(checkout|restore)[[:space:]]+(--[[:space:]]+)?\.'
  '\bgh[[:space:]]+(pr|release|repo)[[:space:]]+(create|merge|close|edit|delete)\b'
  '\bgh[[:space:]]+api\b[^"]*(-X[[:space:]=]*(POST|PUT|PATCH|DELETE)|--method[[:space:]=]*(POST|PUT|PATCH|DELETE)|-[fF]\b|--raw-field|--input)'
)
for p in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qE "$p"; then
    echo "BLOCKED: command matches '$p'. The user runs git mutations manually." >&2
    exit 2
  fi
done
exit 0
