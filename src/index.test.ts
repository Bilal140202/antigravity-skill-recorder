import test from "node:test";
import assert from "node:assert/strict";
import * as fs from "fs";
import * as path from "path";
import { SessionStore } from "./store/session-store";
import { SessionRecorderManager } from "./collector/manager";
import { DescriberPipeline } from "./pipeline/describer";
import { AntigravitySkillBuilder } from "./pipeline/builder";

test("SessionStore creates valid session metadata and append events", () => {
  const store = new SessionStore("Unit Test Workflow");
  assert.ok(store.meta.id);
  assert.equal(store.meta.title, "Unit Test Workflow");

  const ev = store.appendEvent("command_exec", "terminal", { command: "git status", exitCode: 0 });
  assert.equal(ev.seq, 0);
  assert.equal(ev.type, "command_exec");

  store.finalize();
  assert.ok(fs.existsSync(path.join(store.dir, "session.json")));
  assert.ok(fs.existsSync(path.join(store.dir, "events.jsonl")));
});

test("SessionRecorderManager records commands and builds valid SKILL.md", () => {
  const manager = new SessionRecorderManager("Build Antigravity App");
  manager.terminal.recordCommand("npm run test");
  manager.terminal.recordCommand("npm run build");
  const store = manager.stop();

  const analysis = DescriberPipeline.analyzeSession(store.meta.id);
  assert.equal(analysis.intent, "Build Antigravity App");
  assert.ok(analysis.steps.length > 0);

  const plan = AntigravitySkillBuilder.planFromAnalysis(analysis);
  assert.ok(plan.name);

  const testTmp = path.join(__dirname, "../sessions/test_export_tmp");
  const pkg = AntigravitySkillBuilder.buildSkillPackage(plan, testTmp);

  assert.ok(fs.existsSync(pkg.skillFilePath));
  assert.ok(pkg.skillMarkdown.includes("---"));
  assert.ok(pkg.skillMarkdown.includes("name:"));
});
