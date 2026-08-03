import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export function findWorkspaceRoot(startDir: string = process.cwd()): string {
  let curr = path.resolve(startDir);
  while (curr !== path.dirname(curr)) {
    if (fs.existsSync(path.join(curr, ".git")) || fs.existsSync(path.join(curr, ".agents"))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  return process.cwd();
}

export function getAntigravityGlobalConfigDir(): string {
  const home = os.homedir();
  const dir = path.join(home, ".gemini", "antigravity-cli");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function listInstalledSkills(workspaceDir: string): string[] {
  const workspaceSkillsDir = path.join(workspaceDir, ".agents", "skills");
  const globalSkillsDir = path.join(getAntigravityGlobalConfigDir(), "skills");
  const skills: string[] = [];

  if (fs.existsSync(workspaceSkillsDir)) {
    const entries = fs.readdirSync(workspaceSkillsDir);
    skills.push(...entries.map(e => `[Workspace] ${e}`));
  }

  if (fs.existsSync(globalSkillsDir)) {
    const entries = fs.readdirSync(globalSkillsDir);
    skills.push(...entries.map(e => `[Global] ${e}`));
  }

  return skills;
}
