# Performance Optimization

## Context Window Management

Avoid last 20% of context window for:
- Large-scale refactoring
- Feature implementation spanning multiple files
- Debugging complex interactions

Lower context sensitivity tasks:
- Single-file edits
- Independent utility creation
- Documentation updates
- Simple bug fixes

## Extended Thinking + Plan Mode

Where the environment exposes extended thinking (Claude Code: on by default, reserves a bounded reasoning-token budget; availability depends on the API provider), use it for deep-reasoning tasks.

Controls (Claude Code):
- **Toggle**: Option+T (macOS) / Alt+T (Windows/Linux)
- **Config**: `alwaysThinkingEnabled` in `~/.claude/settings.json`
- **Budget cap**: `export MAX_THINKING_TOKENS=10000`
- **Verbose mode**: Ctrl+O to see thinking output

For complex tasks:
1. Ensure extended thinking is on (where available)
2. Enable **Plan Mode** for structured approach
3. Use multiple critique rounds for thorough analysis
4. Use split-role subagents for diverse perspectives

## Build Troubleshooting

If build fails:
1. Use `react-build-resolver` agent (React) or the `diagnose` skill (general)
2. Analyze error messages
3. Fix incrementally
4. Verify after each fix