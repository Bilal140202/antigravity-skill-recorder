import { exec } from "child_process";
import { SessionStore } from "../store/session-store";

export class WindowCollector {
  private store: SessionStore;
  private timer?: NodeJS.Timeout;
  private lastApp = "";
  private lastTitle = "";

  constructor(store: SessionStore) {
    this.store = store;
  }

  start(intervalMs = 2000): void {
    this.timer = setInterval(() => this.pollActiveWindow(), intervalMs);
    this.pollActiveWindow();
  }

  private pollActiveWindow(): void {
    // Cross-platform window query fallback using shell tools
    if (process.platform === "linux") {
      exec("xdotool getactivewindow getwindowname 2>/dev/null", (err, stdout) => {
        if (!err && stdout) {
          const title = stdout.trim();
          if (title !== this.lastTitle) {
            this.lastTitle = title;
            this.store.appendEvent("window_focus", "window", { app: "X11", title });
          }
        }
      });
    } else if (process.platform === "darwin") {
      exec('osascript -e "tell application \\"System Events\\" to get name of first process whose frontmost is true"', (err, stdout) => {
        if (!err && stdout) {
          const app = stdout.trim();
          if (app !== this.lastApp) {
            this.lastApp = app;
            this.store.appendEvent("window_focus", "window", { app, title: app });
          }
        }
      });
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
