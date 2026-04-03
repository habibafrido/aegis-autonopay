import { Hono } from "hono";
import { processPayment } from "../../agent/index.js";

const app = new Hono();

app.post("/pay", async (c) => {
  const body = await c.req.json();

  if (!body.amount || !body.recipient || !body.purpose) {
    return c.json({ error: "Missing required fields: amount, recipient, purpose" }, 400);
  }

  const result = await processPayment(body);

  if (!result) {
    return c.json({ error: "Payment denied or pending human approval" }, 402);
  }

  return c.json({ success: true, ...result });
});

export default app;