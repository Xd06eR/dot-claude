#!/bin/bash

INPUT=$(cat)
# Extract command field without jq — match "command":"..." from JSON input
COMMAND=$(echo "$INPUT" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')

# Closes the Read-deny residual: bash cat/head/tail/read could bypass
# Read(~/.ssh/**) and Read(**/.env) via the auto-allowed rtk read commands.
# Block any bash command that touches .env files or the ~/.ssh directory.
SECRET_PATTERNS=( '\.env' '\.ssh' )
for pattern in "${SECRET_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches secret-path pattern '$pattern'. The user has prevented reading .env / ~/.ssh via bash." >&2
    exit 2
  fi
done

exit 0
