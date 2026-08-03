# Changelog

All notable changes to `antigravity-skill-recorder` will be documented in this file.

## [1.0.0] - 2026-08-03
### Added
- Initial production release of Google Antigravity Skill Recorder CLI.
- Multi-collector engine (`TerminalCollector`, `WindowCollector`, `FrameExtractor`, `AudioNarrationCollector`).
- `SessionStore` append-only JSONL manager with path safety.
- `DescriberPipeline` & `AntigravitySkillBuilder` targeting `.agents/skills/<name>/SKILL.md`.
- CLI commands (`record`, `list`, `analyze`, `export`, `play`, `doctor`, `gstack-review`).
- GStack role integration (`CEO`, `ENGINEERING_MANAGER`, `QA_LEAD`, `SECURITY_OFFICER`).
