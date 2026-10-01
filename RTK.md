# RTK - Rust Token Killer

Token-optimized CLI proxy. The Claude Code hook rewrites other commands automatically. The meta command is the raw, unfiltered path, for debugging only; call it directly:

```bash
rtk proxy <cmd>
```

Complex shell pipelines (chained `find`/`grep`/`sort`/`sed`) can come back garbled through the hook rewrite: use the dedicated Grep/Glob tools for multi-step filtering instead of routed shell chains.

Run `rtk --help` for the full command set.
