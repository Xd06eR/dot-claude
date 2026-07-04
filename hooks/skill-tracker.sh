#!/bin/bash
# Announce Skill tool invocations in-session for inventory visibility.
# PreToolUse matcher: Skill. Exit 0 always (never blocks).
# Side-effect-free: no files, no folders. Stderr only.

INPUT=$(cat)
SKILL=$(echo "$INPUT" | sed -n 's/.*"skill"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
[ -z "$SKILL" ] && exit 0

echo "Using ${SKILL}" >&2
exit 0
