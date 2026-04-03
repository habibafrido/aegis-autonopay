import { Hono } from "hono";

const app = new Hono();

app.get("/status", (c) => {
  return c.json({
    name: "OWS-MPP Payment Agent",
    version: "1.0.0",
    status: "ok",
    rails: ["x402 (Base)", "mpp-charge (Tempo)", "mpp-session (Tempo)"],
    policy: {
      spendLimitPerTx:   Number(process.env.AGENT_SPEND_LIMIT_PER_TX ?? 5),
      dailyCap:          Number(process.env.AGENT_DAILY_CAP ?? 50),
      approvalThreshold: Number(process.env.HUMAN_APPROVAL_THRESHOLD ?? 20),
    },
    chains: ["eip155:8453 (Base)", "eip155:19012 (Tempo)"],
    time: new Date().toISOString(),
  });
});

export default app;