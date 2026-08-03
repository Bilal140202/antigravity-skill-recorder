import * as fs from "fs";
import * as path from "path";
import { AnalysisResult, SkillPlan, AntigravitySkillPackage } from "../types";

export class AntigravitySkillBuilder {
  static planFromAnalysis(analysis: AnalysisResult): SkillPlan {
    const slugName = analysis.intent
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "recorded-antigravity-skill";

    return {
      name: slugName,
      title: analysis.intent,
      description: `Automated skill package generated from session recording: ${analysis.intent}`,
      allowedTools: analysis.detectedTools,
      rules: [
        "Maintain documentation integrity.",
        "Preserve existing API contracts.",
        "Verify command outputs before proceeding."
      ],
      steps: analysis.steps,
      variables: analysis.detectedParameters,
      helperScripts: [
        {
          filename: "verify_env.sh",
          language: "bash",
          content: "#!/usr/bin/env bash\necho 'Verifying workspace environment...'\nexit 0\n"
        }
      ]
    };
  }

  static buildSkillPackage(plan: SkillPlan, targetProjectDir: string): AntigravitySkillPackage {
    const skillDir = path.join(targetProjectDir, ".agents", "skills", plan.name);
    fs.mkdirSync(skillDir, { recursive: true });

    // 1. SKILL.md Frontmatter & Body
    const yamlFrontmatter = [
      "---",
      `name: ${plan.name}`,
      `description: ${plan.description}`,
      "allowed-tools:",
      ...plan.allowedTools.map(t => `  - ${t}`),
      "---"
    ].join("\n");

    const stepsMarkdown = plan.steps
      .map(s => `### Step ${s.id}: ${s.title}\n- **Kind**: ${s.kind}\n- **Instruction**: ${s.text}\n- **Tool**: \`${s.tool || "run_command"}\``)
      .join("\n\n");

    const bodyMarkdown = [
      `# ${plan.title}`,
      "",
      `> **Overview**: ${plan.description}`,
      "",
      "## Execution Steps",
      stepsMarkdown,
      "",
      "## Guidelines & Best Practices",
      ...plan.rules.map(r => `- ${r}`),
      ""
    ].join("\n");

    const fullSkillContent = `${yamlFrontmatter}\n\n${bodyMarkdown}`;
    const skillFilePath = path.join(skillDir, "SKILL.md");
    fs.writeFileSync(skillFilePath, fullSkillContent);

    // 2. Helper Scripts directory
    const helperScripts: Array<{ name: string; path: string; content: string }> = [];
    if (plan.helperScripts.length > 0) {
      const scriptsDir = path.join(skillDir, "scripts");
      fs.mkdirSync(scriptsDir, { recursive: true });

      for (const script of plan.helperScripts) {
        const scriptPath = path.join(scriptsDir, script.filename);
        fs.writeFileSync(scriptPath, script.content);
        if (process.platform !== "win32") {
          try { fs.chmodSync(scriptPath, 0o755); } catch {}
        }
        helperScripts.push({ name: script.filename, path: scriptPath, content: script.content });
      }
    }

    // 3. Antigravity Rules integration (.agents/rules/)
    const rulesDir = path.join(targetProjectDir, ".agents", "rules");
    fs.mkdirSync(rulesDir, { recursive: true });
    const ruleContent = `# ${plan.name} Rules\n\n- ${plan.rules.join("\n- ")}\n`;
    const ruleFilePath = path.join(rulesDir, `${plan.name}-rules.md`);
    fs.writeFileSync(ruleFilePath, ruleContent);

    // 4. Subagent Definition (.agents/subagents/)
    const subagentDir = path.join(targetProjectDir, ".agents", "subagents");
    fs.mkdirSync(subagentDir, { recursive: true });
    const subagentConfig = {
      name: `${plan.name}-subagent`,
      description: plan.description,
      tools: plan.allowedTools,
      skillReference: `.agents/skills/${plan.name}/SKILL.md`
    };
    fs.writeFileSync(path.join(subagentDir, `${plan.name}-subagent.json`), JSON.stringify(subagentConfig, null, 2));

    return {
      name: plan.name,
      description: plan.description,
      allowedTools: plan.allowedTools,
      skillMarkdown: fullSkillContent,
      skillFilePath,
      helperScripts,
      rulesFile: { path: ruleFilePath, content: ruleContent },
      exportTimestamp: new Date().toISOString()
    };
  }
}
