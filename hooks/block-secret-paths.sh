#!/bin/bash
# PreToolUse(Bash) guardrail: backstop the Read-deny for secret paths —
# Bash cat/head/grep could otherwise bypass the Read-deny rules.
# '.env' is delimiter-anchored (space, =, /, \, quote) so 'process.env'
# doesn't false-positive.
# Matching is case-insensitive (case-insensitive filesystems).
# One pattern covers .env / .env.* / .envrc by shared prefix.
# Greps raw JSON: no jq/sed (robust to embedded quotes).
# Residual, accepted: shell glob/metachar forms (cat *.env,
# ~/.ss[h]/id_rsa) expand in the shell after the hook sees raw text.
INPUT=$(cat)
SECRET_PATTERNS=( '[ =/"'"'"'\\]\.env' '\.ssh' '\.aws' '\.config[\\/]gh' )
for p in "${SECRET_PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qiE "$p"; then
    echo "BLOCKED: command matches secret-path '$p'. Reading credential files is denied." >&2
    exit 2
  fi
done
exit 0
