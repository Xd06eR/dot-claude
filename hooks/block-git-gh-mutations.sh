#!/bin/bash
# PreToolUse(Bash) guardrail: block dangerous git/gh mutations by accident.
# The user runs all git/gh mutations manually (CLAUDE.md Git section).
# Also rejects 'git -C <path>' (global-flag position only): it breaks the
# allow-list prefix match and prompts the user; plain git runs allowed.
# Greps the raw hook JSON directly: no jq/sed.
# An embedded quote would truncate a sed capture and hide a dangerous tail.
# Patterns are word-anchored: near-misses like "gitcommittee" never block.
# String literals inside a command match too (echo "git push") — rare, accepted.
# Accident guardrail, not a security boundary.
# Residuals, accepted: quoting/flag-order bypasses (git "commit" -m x,
# git -P commit), an incomplete gh verb set (open: gh auth login/logout/
# refresh, gh ssh-key/gpg-key add/delete, gh label/extension/project
# mutations), prose-only git mutations (rebase, merge, cherry-pick, tag,
# stash push, update-ref), and script-authoring false positives
# (heredocs containing git push).
# gh api graphql -f stays blocked though a query {} is a read:
# a mutation {} document needs the block more than the read needs the pass.
INPUT=$(cat)
GIT_GFLAGS='([[:space:]]+(-[cC][[:space:]]+\S+|--\S+=\S+))*'
DANGEROUS_PATTERNS=(
  '\bgit'"$GIT_GFLAGS"'[[:space:]]+(commit|push)\b'
  '\bpush[[:space:]]+(-f\b|--force)'
  '\bgit'"$GIT_GFLAGS"'[[:space:]]+reset[[:space:]]+--hard\b'
  '\bgit'"$GIT_GFLAGS"'[[:space:]]+clean[[:space:]]+(--force|-[a-zA-Z]*f)'
  '\bgit'"$GIT_GFLAGS"'[[:space:]]+branch[[:space:]]+(-D\b|-d[[:space:]]+--force)'
  '\bgit'"$GIT_GFLAGS"'[[:space:]]+(checkout|restore)[[:space:]]+(--[[:space:]]+)?\.'
  '\bgh[[:space:]]+(pr|release|repo|issue|gist|workflow|secret|variable|run)[[:space:]]+(create|merge|close|edit|delete|comment|review|ready|run|set|fork|cancel|rerun)\b'
  '\bgh[[:space:]]+api\b[^"]*(-X[[:space:]=]*([Pp][Oo][Ss][Tt]|[Pp][Uu][Tt]|[Pp][Aa][Tt][Cc][Hh]|[Dd][Ee][Ll][Ee][Tt][Ee])|--method[[:space:]=]*([Pp][Oo][Ss][Tt]|[Pp][Uu][Tt]|[Pp][Aa][Tt][Cc][Hh]|[Dd][Ee][Ll][Ee][Tt][Ee])|-[fF]\b|--raw-field|--input)'
)
for p in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qE "$p"; then
    echo "BLOCKED: command matches '$p'. Git/gh mutations are denied." >&2
    exit 2
  fi
done
if echo "$INPUT" | grep -qE '\bgh[[:space:]]+auth[[:space:]]+token\b'; then
  echo "BLOCKED: 'gh auth token' prints the stored OAuth token. Credential output is denied." >&2
  exit 2
fi
if echo "$INPUT" | grep -qE '\bgit([[:space:]]+(-c[[:space:]]+\S+|--\S+))*[[:space:]]+-C\b'; then
  echo "BLOCKED: 'git -C <path>' is denied. Run plain git from the working directory." >&2
  exit 2
fi
exit 0
