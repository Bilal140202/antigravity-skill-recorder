#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { handleRecordCommand } from "./commands/record";
import { handleListCommand } from "./commands/list";
import { handleAnalyzeCommand } from "./commands/analyze";
import { handleExportCommand } from "./commands/export";
import { handlePlayCommand } from "./commands/play";
import { handleDoctorCommand } from "./commands/doctor";
import { handleGStackReviewCommand } from "./commands/gstack-review";

const program = new Command();

program
  .name("agy-skill-recorder")
  .description("Google Antigravity Skill Recorder CLI & GStack Workflow Engine - Record CLI/GUI work sessions & export standard Antigravity AI Agent Skills")
  .version("1.0.0");

program
  .command("record")
  .description("Record an interactive session (CLI commands, window focus, screenshots, and narration)")
  .option("-t, --title <title>", "Custom title for the recording session")
  .action(async (options) => {
    await handleRecordCommand(options.title);
  });

program
  .command("list")
  .description("List all recorded sessions in the session store")
  .action(() => {
    handleListCommand();
  });

program
  .command("analyze <sessionId>")
  .description("Analyze a recorded session trajectory into structured steps and tool dependencies")
  .action((sessionId) => {
    handleAnalyzeCommand(sessionId);
  });

program
  .command("export <sessionId>")
  .description("Build and export an Antigravity SKILL.md package from an analyzed session")
  .option("-d, --dir <dir>", "Target workspace directory (defaults to current project root)")
  .action((sessionId, options) => {
    handleExportCommand(sessionId, options.dir);
  });

program
  .command("play <sessionId>")
  .description("Replay session event trajectory timeline in terminal")
  .action((sessionId) => {
    handlePlayCommand(sessionId);
  });

program
  .command("doctor")
  .description("Verify system dependencies, permissions, and Antigravity ecosystem setup")
  .action(() => {
    handleDoctorCommand();
  });

program
  .command("gstack-review")
  .description("Run GStack role-based perfection & quality review audit")
  .action(() => {
    handleGStackReviewCommand();
  });

program.parse(process.argv);
