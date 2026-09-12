#!/bin/bash
# PreToolUse(Bash) guardrail: backstop the Read-deny for secret paths —
# Bash cat/head/grep could otherwise bypass the Read-deny rules.
# '.env' is delimiter-anchored (space, =, /, quote) so 'process.env' doesn't
# false-positive; one pattern covers .env / .env.* / .envrc by shared prefix.
# Greps raw JSON: no jq/sed (robust to embedded quotes).
INPUT=$(cat)
SECRET_PATTERNS=( '[ =/"'"'"']\.env' '\.ssh' '\.aws' '\.config[\\/]gh' )
for p in "${SECRET_PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qE "$p"; then
    echo "BLOCKED: command matches secret-path '$p'. Reading .env / ~/.ssh is denied." >&2
    exit 2
  fi
done
exit 0
