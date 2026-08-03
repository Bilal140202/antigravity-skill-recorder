export interface SessionMeta {
  id: string;
  title: string;
  startedAt: string;
  stoppedAt?: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  dir: string;
  environment?: Record<string, string>;
}

export type EventType =
  | "terminal_input"
  | "terminal_output"
  | "command_exec"
  | "window_focus"
  | "url_visit"
  | "user_annotation"
  | "screenshot_captured"
  | "narration_chunk";

export interface RecEvent {
  seq: number;
  t: number;
  epoch: number;
  type: EventType;
  source: "terminal" | "window" | "user" | "audio" | "system";
  payload: Record<string, any>;
}

export interface AnalysisStep {
  id: number;
  title: string;
  text: string;
  kind: "calculation" | "action";
  tool?: string;
  evidence: string[];
  startMs: number;
  endMs: number;
}

export interface AnalysisResult {
  sessionId: string;
  intent: string;
  summary: string;
  steps: AnalysisStep[];
  generalizationNotes: string;
  detectedTools: string[];
  detectedParameters: Array<{ name: string; description: string; defaultValue?: string }>;
}

export interface SkillPlan {
  name: string;
  title: string;
  description: string;
  allowedTools: string[];
  rules: string[];
  steps: AnalysisStep[];
  variables: Array<{ name: string; description: string; defaultValue?: string }>;
  helperScripts: Array<{ filename: string; language: string; content: string }>;
}

export interface AntigravitySkillPackage {
  name: string;
  description: string;
  allowedTools: string[];
  skillMarkdown: string;
  skillFilePath: string;
  helperScripts: Array<{ name: string; path: string; content: string }>;
  rulesFile?: { path: string; content: string };
  exportTimestamp: string;
}
