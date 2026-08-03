import chalk from "chalk";
import ora from "ora";
import { DescriberPipeline } from "../pipeline/describer";
import { AntigravitySkillBuilder } from "../pipeline/builder";
import { findWorkspaceRoot } from "../utils/antigravity";

export function handleExportCommand(sessionId: string, targetDirOption?: string): void {
  console.log(chalk.bold.cyan("\n✨ Building Google Antigravity Skill Package..."));
  console.log(chalk.gray(`Target Session ID: ${sessionId}\n`));

  const spinner = ora("Translating session steps into Antigravity SKILL.md format...").start();

  try {
    const analysis = DescriberPipeline.analyzeSession(sessionId);
    const plan = AntigravitySkillBuilder.planFromAnalysis(analysis);
    const targetDir = targetDirOption || findWorkspaceRoot();

    const pkg = AntigravitySkillBuilder.buildSkillPackage(plan, targetDir);
    spinner.succeed("Skill Package Exported Successfully!");

    console.log(chalk.bold.green(`\n✓ Skill Name: `) + chalk.white(pkg.name));
    console.log(chalk.bold.green(`✓ Location:   `) + chalk.cyan(pkg.skillFilePath));
    console.log(chalk.bold.blue(`✓ Allowed Tools: `) + chalk.white(pkg.allowedTools.join(", ")));

    console.log(chalk.bold.white("\nGenerated SKILL.md Preview:"));
    console.log(chalk.gray("-".repeat(60)));
    const lines = pkg.skillMarkdown.split("\n").slice(0, 20);
    console.log(lines.join("\n"));
    if (pkg.skillMarkdown.split("\n").length > 20) {
      console.log(chalk.gray("... [truncated for preview]"));
    }
    console.log(chalk.gray("-".repeat(60)));

    console.log(chalk.green(`\nYour skill is now active in your workspace at .agents/skills/${pkg.name}/SKILL.md!`));
    console.log(chalk.cyan(`You can invoke it with the Antigravity CLI (\`agy\`) or inside Antigravity IDE / 2.0!\n`));
  } catch (err: any) {
    spinner.fail("Skill export failed.");
    console.error(chalk.red(`Error: ${err.message}\n`));
  }
}
