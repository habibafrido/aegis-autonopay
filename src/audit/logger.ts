import { appendFile, mkdir } from "fs/promises";
import path from "path";

export interface AuditEntry {
  purpose: string;
  amount: number;
  recipient: string;
  status: "success" | "denied" | "pending";
  rail?: string;
  txHash?: string;
  sessionId?: string;
  receipt?: string;
  reason?: string;
  ts: string;
}

export class AuditLogger {
  private logPath = "./audit/ledger.jsonl";

  async log(entry: Omit<AuditEntry, "ts">) {
    await mkdir(path.dirname(this.logPath), { recursive: true });
    const line = JSON.stringify({ ...entry, ts: new Date().toISOString() });
    await appendFile(this.logPath, line + "\n");
    console.log(`[Audit] Logged: ${entry.status} | ${entry.purpose}`);
  }
}