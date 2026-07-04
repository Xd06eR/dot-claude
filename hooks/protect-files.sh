#!/bin/bash
# Block edits/writes to files holding secrets or key material.
# PreToolUse matcher: Edit|Write|MultiEdit. Exit 2 on match.
# These files must be edited manually outside Claude.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
[ -z "$FILE_PATH" ] && exit 0

PROTECTED_PATTERNS=(
  '\.env$'
  '\.env\.'
  'credentials'
  '\.pem$'
  '\.key$'
  'id_rsa'
  'id_ed25519'
  'id_ecdsa'
  'secrets\.ya\?ml$'
  'secrets\.json$'
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    echo "BLOCKED: '$FILE_PATH' matches protected pattern '$pattern'. Secrets and key material must be edited manually outside Claude." >&2
    exit 2
  fi
done

exit 0
