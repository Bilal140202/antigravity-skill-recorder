import chalk from "chalk";
import { execSync } from "child_process";
import { getSessionsRootDir } from "../store/session-store";
import { getAntigravityGlobalConfigDir } from "../utils/antigravity";

export function handleDoctorCommand(): void {
  console.log(chalk.bold.cyan("\n🩺 Antigravity Skill Recorder - System Verification Doctor\n"));

  function check(label: string, fn: () => boolean, detail: string) {
    try {
      if (fn()) {
        console.log(` ${chalk.bold.green("✓")} ${label.padEnd(30)} ${chalk.gray(detail)}`);
      } else {
        console.log(` ${chalk.bold.red("✗")} ${label.padEnd(30)} ${chalk.yellow("Check failed: " + detail)}`);
      }
    } catch {
      console.log(` ${chalk.bold.red("✗")} ${label.padEnd(30)} ${chalk.yellow("Check failed: " + detail)}`);
    }
  }

  check("Node.js Runtime", () => true, process.version);

  check("Antigravity CLI (agy)", () => {
    try {
      execSync("agy --version", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }, "Checks if `agy` CLI binary is installed");

  check("Screen Capture Utility", () => {
    if (process.platform === "linux") {
      try { execSync("which import || which screencapture", { stdio: "ignore" }); return true; } catch { return false; }
    }
    return true;
  }, "Checks if screen capture utility is present");

  check("Session Store Path", () => true, getSessionsRootDir());

  check("Antigravity Config Path", () => true, getAntigravityGlobalConfigDir());

  console.log(chalk.gray("\nDoctor check completed.\n"));
}
