import { Hono } from "hono";
import { getPendingQueue, approvePending, denyPending } from "../../agent/queue.js";

const app = new Hono();

// GET /approve — lihat semua pending
app.get("/approve", (c) => {
  const queue = getPendingQueue();
  return c.json({ pending: queue, count: queue.length });
});

// POST /approve/:id — approve satu transaksi
app.post("/approve/:id", async (c) => {
  const id = c.req.param("id");
  const result = await approvePending(id);

  if (!result) return c.json({ error: "Not found or already processed" }, 404);
  return c.json({ success: true, ...result });
});

// POST /approve/:id/deny — deny satu transaksi
app.post("/approve/:id/deny", async (c) => {
  const id = c.req.param("id");
  denyPending(id);
  return c.json({ success: true, message: "Payment denied" });
});

export default app;