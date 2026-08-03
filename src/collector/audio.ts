import * as fs from "fs";
import * as path from "path";
import { SessionStore } from "../store/session-store";

export class AudioNarrationCollector {
  private store: SessionStore;
  private isRecording = false;

  constructor(store: SessionStore) {
    this.store = store;
  }

  start(): void {
    this.isRecording = true;
    this.store.appendEvent("narration_chunk", "audio", { status: "recording_started" });
  }

  appendTranscription(transcript: string): void {
    if (!this.isRecording) return;
    const narrationPath = path.join(this.store.dir, "narration.txt");
    fs.appendFileSync(narrationPath, `[${new Date().toISOString()}] ${transcript}\n`);
    this.store.appendEvent("narration_chunk", "audio", { transcript });
  }

  stop(): void {
    this.isRecording = false;
    this.store.appendEvent("narration_chunk", "audio", { status: "recording_stopped" });
  }
}
