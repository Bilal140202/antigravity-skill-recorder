import { SessionStore } from "../store/session-store";
import { TerminalCollector } from "./terminal";
import { WindowCollector } from "./window";
import { FrameExtractor } from "./frame";
import { AudioNarrationCollector } from "./audio";

export class SessionRecorderManager {
  readonly store: SessionStore;
  readonly terminal: TerminalCollector;
  readonly window: WindowCollector;
  readonly frames: FrameExtractor;
  readonly audio: AudioNarrationCollector;

  constructor(title: string) {
    this.store = new SessionStore(title);
    this.terminal = new TerminalCollector(this.store);
    this.window = new WindowCollector(this.store);
    this.frames = new FrameExtractor(this.store);
    this.audio = new AudioNarrationCollector(this.store);
  }

  start(): void {
    this.terminal.start();
    this.window.start();
    this.frames.start();
    this.audio.start();
  }

  recordAnnotation(annotation: string): void {
    this.store.appendEvent("user_annotation", "user", { annotation });
  }

  stop(): SessionStore {
    this.terminal.stop();
    this.window.stop();
    this.frames.stop();
    this.audio.stop();
    this.store.finalize();
    return this.store;
  }
}
