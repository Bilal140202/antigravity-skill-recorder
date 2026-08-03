import chalk from "chalk";
import { SessionStore } from "../store/session-store";

export function handlePlayCommand(sessionId: string): void {
  console.log(chalk.bold.cyan("\n▶ Replaying Session Trajectory..."));
  console.log(chalk.gray(`Target Session ID: ${sessionId}\n`));

  try {
    const store = SessionStore.load(sessionId);
    const events = store.getEvents();

    console.log(chalk.bold.white(`Title: `) + store.meta.title);
    console.log(chalk.bold.white(`Started At: `) + new Date(store.meta.startedAt).toLocaleString());
    console.log(chalk.bold.white(`Events Count: `) + events.length + "\n");

    for (const ev of events) {
      const timeStr = `[+${(ev.t / 1000).toFixed(2)}s]`;
      let detail = JSON.stringify(ev.payload);
      if (ev.type === "command_exec") {
        detail = chalk.bold.yellow(ev.payload.command);
      } else if (ev.type === "window_focus") {
        detail = chalk.cyan(`App: ${ev.payload.app} | ${ev.payload.title}`);
      } else if (ev.type === "user_annotation") {
        detail = chalk.bold.green(`Note: ${ev.payload.annotation}`);
      }

      console.log(`${chalk.gray(timeStr)} ${chalk.blue(ev.type.padEnd(20))} ${detail}`);
    }

    console.log(chalk.gray("\nReplay finished.\n"));
  } catch (err: any) {
    console.error(chalk.red(`Replay failed: ${err.message}\n`));
  }
}
