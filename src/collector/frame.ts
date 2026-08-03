import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { SessionStore } from "../store/session-store";

export class FrameExtractor {
  private store: SessionStore;
  private timer?: NodeJS.Timeout;
  private frameCount = 0;

  constructor(store: SessionStore) {
    this.store = store;
  }

  start(intervalMs = 5000): void {
    this.timer = setInterval(() => this.captureSnapshot(), intervalMs);
    this.captureSnapshot();
  }

  captureSnapshot(): void {
    const filename = `frame_${String(this.frameCount++).padStart(4, "0")}.png`;
    const framePath = path.join(this.store.dir, "frames", filename);

    // Platform screen capture tool
    if (process.platform === "linux") {
      exec(`import -window root "${framePath}" 2>/dev/null || screencapture "${framePath}" 2>/dev/null`, (err) => {
        if (!err && fs.existsSync(framePath)) {
          this.store.appendEvent("screenshot_captured", "system", {
            filename,
            path: framePath
          });
        }
      });
    } else if (process.platform === "darwin") {
      exec(`screencapture -x "${framePath}"`, (err) => {
        if (!err && fs.existsSync(framePath)) {
          this.store.appendEvent("screenshot_captured", "system", {
            filename,
            path: framePath
          });
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
