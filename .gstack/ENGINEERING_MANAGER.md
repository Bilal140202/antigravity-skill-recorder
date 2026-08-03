# GStack Engineering Manager Architecture Standards

## Engineering Guardrails
1. **Strong Typing**: 100% TypeScript coverage with strict compiler checks enabled.
2. **Modular Architecture**: Decoupled collector modules (`terminal`, `window`, `frame`, `audio`) managed by a unified `SessionRecorderManager`.
3. **Safe Storage**: Append-only event streams (`events.jsonl`) with traversal-guarded paths.
4. **Deterministic Generation**: Describer and Builder pipelines output valid Google Antigravity SKILL.md markdown files.
