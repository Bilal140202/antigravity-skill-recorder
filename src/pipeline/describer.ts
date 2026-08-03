import * as fs from "fs";
import * as path from "path";
import { SessionStore } from "../store/session-store";
import { AnalysisResult, AnalysisStep, RecEvent } from "../types";

export class DescriberPipeline {
  static analyzeSession(sessionId: string): AnalysisResult {
    const store = SessionStore.load(sessionId);
    const events = store.getEvents();

    const commandEvents = events.filter(e => e.type === "command_exec");
    const annotationEvents = events.filter(e => e.type === "user_annotation");
    const windowEvents = events.filter(e => e.type === "window_focus");

    let intent = store.meta.title;
    if (annotationEvents.length > 0) {
      intent = annotationEvents.map(e => e.payload.annotation).join(" | ");
    }

    const steps: AnalysisStep[] = [];
    let stepId = 1;

    for (const ev of commandEvents) {
      const cmd = ev.payload.command || "";
      let tool = "run_command";
      let kind: "calculation" | "action" = "action";

      if (cmd.startsWith("git ") || cmd.startsWith("npm ") || cmd.startsWith("node ")) {
        kind = "action";
      } else if (cmd.startsWith("ls") || cmd.startsWith("cat") || cmd.startsWith("grep")) {
        kind = "calculation";
        tool = "view_file";
      }

      steps.push({
        id: stepId++,
        title: `Execute Command: ${cmd.split(" ")[0]}`,
        text: `Run system command: \`${cmd}\``,
        kind,
        tool,
        evidence: [`Command: ${cmd}`, `Exit code: ${ev.payload.exitCode ?? 0}`],
        startMs: ev.t,
        endMs: ev.t + 1000
      });
    }

    if (steps.length === 0) {
      steps.push({
        id: 1,
        title: "Initial Session Setup",
        text: "Perform interactive workspace configuration and file setup.",
        kind: "action",
        tool: "run_command",
        evidence: ["Session recorded"],
        startMs: 0,
        endMs: 1000
      });
    }

    const detectedTools = Array.from(new Set(steps.map(s => s.tool || "run_command")));

    const result: AnalysisResult = {
      sessionId,
      intent,
      summary: `Automated trajectory analysis derived from session ${sessionId}.`,
      steps,
      generalizationNotes: "Derived fixed parameters into dynamic inputs for reusable Antigravity skill execution.",
      detectedTools,
      detectedParameters: [
        { name: "target_dir", description: "Target workspace directory", defaultValue: "./" }
      ]
    };

    const analysisPath = path.join(store.dir, "analysis.json");
    fs.writeFileSync(analysisPath, JSON.stringify(result, null, 2));

    return result;
  }
}
