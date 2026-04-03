import { Hono } from "hono";
import { readFile } from "fs/promises";

interface AuditEntry {
  status: string;
  rail?: string;
  amount?: number;
  [key: string]: unknown;
}

const app = new Hono();

app.get("/audit", async (c) => {
  try {
    const raw = await readFile("./audit/ledger.jsonl", "utf8");

    const entries: AuditEntry[] = raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as AuditEntry);

    const summary = {
      total:    entries.length,
      approved: entries.filter((e) => e.status === "success").length,
      denied:   entries.filter((e) => e.status === "denied").length,
      pending:  entries.filter((e) => e.status === "pending").length,
      byRail: {
        x402:       entries.filter((e) => e.rail === "x402").length,
        mppCharge:  entries.filter((e) => e.rail === "mpp-charge").length,
        mppSession: entries.filter((e) => e.rail === "mpp-session").length,
      },
      totalSpentUSD: entries
        .filter((e) => e.status === "success")
        .reduce((sum, e) => sum + (e.amount ?? 0), 0)
        .toFixed(2),
    };

    return c.json({ summary, entries });
  } catch {
    return c.json({ summary: { total: 0 }, entries: [] });
  }
});

export default app;