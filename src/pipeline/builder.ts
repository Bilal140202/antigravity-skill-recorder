import * as fs from "fs";
import * as path from "path";
import { SessionStore } from "../store/session-store";
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
      description: `Automated skill generated from session recording for: ${analysis.intent}`,
      allowedTools: analysis.detectedTools,
      rules: [
        "Maintain documentation integrity.",
        "Preserve existing API contracts.",
        "Never guess file paths without inspecting workspace."
      ],
      steps: analysis.steps,
      variables: analysis.detectedParameters,
      helperScripts: []
    };
  }

  static buildSkillPackage(plan: SkillPlan, targetProjectDir: string): AntigravitySkillPackage {
    const skillDir = path.join(targetProjectDir, ".agents", "skills", plan.name);
    fs.mkdirSync(skillDir, { recursive: true });

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

    // Write helper scripts if any
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

    return {
      name: plan.name,
      description: plan.description,
      allowedTools: plan.allowedTools,
      skillMarkdown: fullSkillContent,
      skillFilePath,
      helperScripts,
      exportTimestamp: new Date().toISOString()
    };
  }
}
