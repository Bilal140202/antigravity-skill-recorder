import chalk from "chalk";
import ora from "ora";
import { DescriberPipeline } from "../pipeline/describer";

export function handleAnalyzeCommand(sessionId: string): void {
  console.log(chalk.bold.cyan("\n🧠 Analyzing Recorded Session Trajectory..."));
  console.log(chalk.gray(`Target Session ID: ${sessionId}\n`));

  const spinner = ora("Parsing event stream, extracting steps, and identifying tools...").start();

  try {
    const analysis = DescriberPipeline.analyzeSession(sessionId);
    spinner.succeed("Session Analysis Complete!");

    console.log(chalk.bold.green(`\nDerived Intent: `) + chalk.white(analysis.intent));
    console.log(chalk.bold.yellow(`Summary: `) + chalk.gray(analysis.summary));
    console.log(chalk.bold.blue(`Detected Tools: `) + chalk.cyan(analysis.detectedTools.join(", ")));

    console.log(chalk.bold.white("\nOrdered Execution Steps:"));
    for (const step of analysis.steps) {
      console.log(`  ${chalk.green(step.id + ".")} ${chalk.bold(step.title)} (${step.kind})`);
      console.log(`     ${chalk.gray(step.text)}`);
    }

    console.log(chalk.cyan(`\nNext Step: Export into Antigravity SKILL.md package:`));
    console.log(chalk.bold.white(`  agy-skill-recorder export ${sessionId}\n`));
  } catch (err: any) {
    spinner.fail("Analysis failed.");
    console.error(chalk.red(`Error: ${err.message}\n`));
  }
}
