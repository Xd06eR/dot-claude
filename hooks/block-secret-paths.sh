#!/bin/bash
# PreToolUse(Bash) guardrail: backstop the Read-deny for secret paths.
# Bash cat/head/grep could otherwise bypass the Read-deny rules in settings.json.
#
# Keep COVERAGE in sync with permissions.deny:
#   Read(~/.ssh/**)   Read(**/.env)   Read(**/.env.*)   Read(**/.envrc)
# The '.env' pattern is anchored to a delimiter char (space, =, /, quote)
# so the JS global 'process.env' doesn't false-positive and a quoted path
# (cat '.env') is still caught. One '.env' pattern covers .env, .env.*,
# and .envrc — they share the '.env' prefix (unlike Read globs, which need
# one entry per filename). When deny adds a secret path that does NOT
# start with '.env' (e.g. a key file), add a new pattern here too.
#
# Greps raw JSON: no jq dependency, no sed extraction (robust to embedded quotes).
INPUT=$(cat)
SECRET_PATTERNS=( '[ =/"'"'"']\.env' '\.ssh' )
for p in "${SECRET_PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qE "$p"; then
    echo "BLOCKED: command matches secret-path '$p'. Reading .env / ~/.ssh is denied." >&2
    exit 2
  fi
done
exit 0
