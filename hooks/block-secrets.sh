#!/bin/bash
# Block Bash commands that embed secret values (API keys, tokens, private keys).
# PreToolUse matcher: Bash. Exit 2 on match.
# Runs after rtk hook + block-dangerous-git.sh in the Bash chain.
# Greps the raw JSON input directly: command values often contain escaped
# quotes that break sed extraction, but the secret patterns themselves
# survive in the raw bytes.

INPUT=$(cat)

SECRET_PATTERNS=(
  'sk-[a-zA-Z0-9_-]\{20,\}'
  'AKIA[0-9A-Z]\{16\}'
  'ghp_[a-zA-Z0-9]\{36\}'
  'gho_[a-zA-Z0-9]\{36\}'
  'glpat-[a-zA-Z0-9_-]\{20\}'
  'xox[baprs]-[a-zA-Z0-9-]\{10,\}'
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'
)

for pattern in "${SECRET_PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qE "$pattern"; then
    echo "BLOCKED: command contains a likely secret matching pattern '$pattern'. Do not pass credentials via shell; use env vars or a secrets manager." >&2
    exit 2
  fi
done

exit 0
