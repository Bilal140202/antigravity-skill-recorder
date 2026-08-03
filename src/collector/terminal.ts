import { SessionStore } from "../store/session-store";

export class TerminalCollector {
  private store: SessionStore;
  private isActive = false;
  private currentCommand = "";

  constructor(store: SessionStore) {
    this.store = store;
  }

  start(): void {
    this.isActive = true;
    this.store.appendEvent("terminal_input", "terminal", { action: "terminal_collector_started" });
  }

  recordCommand(command: string, exitCode = 0, outputSnippet = ""): void {
    if (!this.isActive) return;
    this.store.appendEvent("command_exec", "terminal", {
      command,
      exitCode,
      outputSnippet: outputSnippet.slice(0, 1000)
    });
  }

  recordOutput(output: string): void {
    if (!this.isActive) return;
    this.store.appendEvent("terminal_output", "terminal", {
      output: output.slice(0, 500)
    });
  }

  stop(): void {
    this.isActive = false;
    this.store.appendEvent("terminal_input", "terminal", { action: "terminal_collector_stopped" });
  }
}
