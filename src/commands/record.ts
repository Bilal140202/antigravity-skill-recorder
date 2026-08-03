import * as readline from "readline";
import chalk from "chalk";
import ora from "ora";
import { SessionRecorderManager } from "../collector/manager";

export async function handleRecordCommand(titleOption?: string): Promise<void> {
  const title = titleOption || "Interactive CLI Session";

  console.log(chalk.bold.cyan("\n🔴 Antigravity Skill Recorder CLI"));
  console.log(chalk.gray(`Starting recording session: "${title}"`));
  console.log(chalk.yellow("Recording terminal input, active window state, screenshots, and narration...\n"));

  const recorder = new SessionRecorderManager(title);
  recorder.start();

  const spinner = ora("Recording active... Type 'note <msg>' to add an annotation, or 'stop' to finish.\n").start();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.setPrompt(chalk.green("agy-recorder> "));
    rl.prompt();

    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (trimmed === "stop" || trimmed === "exit" || trimmed === "quit") {
        spinner.stop();
        console.log(chalk.bold.yellow("\nStopping session recording..."));
        const store = recorder.stop();
        console.log(chalk.bold.green(`✓ Session saved successfully!`));
        console.log(chalk.gray(`Session ID: ${store.meta.id}`));
        console.log(chalk.gray(`Directory:  ${store.meta.dir}`));
        console.log(chalk.cyan(`Run 'agy-skill-recorder analyze ${store.meta.id}' to generate a Skill.\n`));
        rl.close();
        resolve();
      } else if (trimmed.startsWith("note ")) {
        const note = trimmed.slice(5);
        recorder.recordAnnotation(note);
        console.log(chalk.italic.gray(`[Annotation added: "${note}"]`));
        rl.prompt();
      } else if (trimmed.length > 0) {
        recorder.terminal.recordCommand(trimmed);
        rl.prompt();
      } else {
        rl.prompt();
      }
    });
  });
}
