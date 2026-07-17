#!/bin/bash
# PreToolUse(Bash) guardrail: block dangerous git mutations by accident.
# The user runs all git mutations manually (CLAUDE.md Git section).
# Greps the raw hook JSON directly: no jq dependency, no sed extraction
# (an embedded quote would truncate a sed capture and hide a dangerous tail).
# Patterns are word-anchored so "git committee" and prose don't false-positive.
# Accident guardrail, not a security boundary.
INPUT=$(cat)
DANGEROUS_PATTERNS=(
  '\bgit[[:space:]]+commit\b'
  '\bgit[[:space:]]+push\b'
  '\bgit[[:space:]]+reset[[:space:]]+--hard\b'
  '\bgit[[:space:]]+clean[[:space:]]+-f'
  '\bgit[[:space:]]+branch[[:space:]]+-D\b'
  '\bgit[[:space:]]+checkout[[:space:]]+\.'
  '\bgit[[:space:]]+restore[[:space:]]+\.'
  '\bpush[[:space:]]+--force\b'
)
for p in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qE "$p"; then
    echo "BLOCKED: command matches '$p'. The user runs git mutations manually." >&2
    exit 2
  fi
done
exit 0
