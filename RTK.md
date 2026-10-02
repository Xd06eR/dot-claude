# RTK

Token-optimized CLI proxy. The Claude Code hook rewrites other commands automatically; the meta command `rtk proxy <cmd>` is the raw, unfiltered path, for debugging only.

Complex shell pipelines (chained `find`/`grep`/`sort`/`sed`) can come back garbled through the hook rewrite: use the dedicated Grep/Glob tools for multi-step filtering instead.

Run `rtk --help` for the full command set.
