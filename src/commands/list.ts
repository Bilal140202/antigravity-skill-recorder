import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { getSessionsRootDir } from "../store/session-store";
import { SessionMeta } from "../types";

export function handleListCommand(): void {
  const root = getSessionsRootDir();
  console.log(chalk.bold.cyan("\n📋 Antigravity Skill Recorder - Session History"));
  console.log(chalk.gray(`Storage Directory: ${root}\n`));

  if (!fs.existsSync(root)) {
    console.log(chalk.yellow("No recorded sessions found.\n"));
    return;
  }

  const dirs = fs.readdirSync(root);
  const sessions: SessionMeta[] = [];

  for (const dirName of dirs) {
    const metaPath = path.join(root, dirName, "session.json");
    if (fs.existsSync(metaPath)) {
      try {
        const meta: SessionMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
        sessions.push(meta);
      } catch {}
    }
  }

  if (sessions.length === 0) {
    console.log(chalk.yellow("No valid sessions recorded yet. Run 'agy-skill-recorder record' to start.\n"));
    return;
  }

  sessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  console.log(chalk.bold.white("Session ID                               | Title                          | Started At              | Platform"));
  console.log(chalk.gray("-".repeat(105)));

  for (const s of sessions) {
    const idPad = s.id.padEnd(40, " ");
    const titlePad = (s.title || "Untitled").slice(0, 30).padEnd(30, " ");
    const dateStr = new Date(s.startedAt).toLocaleString().padEnd(23, " ");
    console.log(`${chalk.green(idPad)} | ${titlePad} | ${chalk.gray(dateStr)} | ${s.platform}`);
  }

  console.log(chalk.gray(`\nTotal Sessions: ${sessions.length}\n`));
}
