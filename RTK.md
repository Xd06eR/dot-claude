# RTK - Rust Token Killer

**Usage**: Token-optimized CLI proxy (60-90% savings on dev operations)

## Meta command (always use rtk directly)

```bash
rtk proxy <cmd>       # Execute raw command without filtering (for debugging)
```

## Hook-based usage

All other commands are automatically rewritten by the Claude Code hook.

Complex shell pipelines (chained `find`/`grep`/`sort`/`sed`) can come back garbled through the hook rewrite: use the dedicated Grep/Glob tools for multi-step filtering instead of routed shell chains.

Run `rtk --help` for the full command set.
