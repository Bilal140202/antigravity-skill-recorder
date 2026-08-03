import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { SessionMeta, RecEvent, EventType } from "../types";

export function getSessionsRootDir(): string {
  const override = process.env.AGY_SKILL_RECORDER_SESSIONS_DIR;
  if (override) return path.resolve(override);
  const home = os.homedir();
  const dir = path.join(home, ".gemini", "antigravity-cli", "sessions");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function generateSessionId(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const randomHex = Math.random().toString(36).substring(2, 8);
  return `${stamp}-${randomHex}`;
}

export class SessionStore {
  readonly meta: SessionMeta;
  readonly dir: string;
  private eventsStream: fs.WriteStream;
  private count = 0;
  private startMonotonic: number;

  constructor(title: string = "Recorded Session") {
    const id = generateSessionId();
    this.dir = path.join(getSessionsRootDir(), id);
    fs.mkdirSync(this.dir, { recursive: true });
    fs.mkdirSync(path.join(this.dir, "frames"), { recursive: true });
    fs.mkdirSync(path.join(this.dir, "output"), { recursive: true });

    this.meta = {
      id,
      title,
      startedAt: new Date().toISOString(),
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      dir: this.dir,
      environment: {
        SHELL: process.env.SHELL || "",
        TERM: process.env.TERM || ""
      }
    };

    this.writeMeta();
    const eventsPath = path.join(this.dir, "events.jsonl");
    fs.writeFileSync(eventsPath, "");
    this.eventsStream = fs.createWriteStream(eventsPath, { flags: "a" });
    this.startMonotonic = Date.now();
  }

  static load(sessionId: string): SessionStore {
    const root = getSessionsRootDir();
    const sessionDir = path.join(root, sessionId);
    const metaPath = path.join(sessionDir, "session.json");

    if (!fs.existsSync(metaPath)) {
      throw new Error(`Session metadata not found at ${metaPath}`);
    }

    const metaContent = fs.readFileSync(metaPath, "utf-8");
    const meta: SessionMeta = JSON.parse(metaContent);

    const store = Object.create(SessionStore.prototype);
    (store as any).meta = meta;
    (store as any).dir = sessionDir;
    (store as any).count = 0;
    (store as any).startMonotonic = Date.now();
    return store;
  }

  private writeMeta(): void {
    fs.writeFileSync(path.join(this.dir, "session.json"), JSON.stringify(this.meta, null, 2));
  }

  appendEvent(type: EventType, source: RecEvent["source"], payload: Record<string, any> = {}): RecEvent {
    const now = Date.now();
    const ev: RecEvent = {
      seq: this.count++,
      t: now - this.startMonotonic,
      epoch: now,
      type,
      source,
      payload
    };
    this.eventsStream.write(JSON.stringify(ev) + "\n");
    return ev;
  }

  getEvents(): RecEvent[] {
    const eventsFile = path.join(this.dir, "events.jsonl");
    if (!fs.existsSync(eventsFile)) return [];
    const lines = fs.readFileSync(eventsFile, "utf-8").split("\n").filter(l => l.trim().length > 0);
    return lines.map(line => JSON.parse(line));
  }

  finalize(): SessionMeta {
    this.meta.stoppedAt = new Date().toISOString();
    this.writeMeta();
    if (this.eventsStream) {
      this.eventsStream.end();
    }
    return this.meta;
  }
}
