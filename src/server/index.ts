import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import statusRoutes from "./routes/status.js";
import payRoutes    from "./routes/pay.js";
import auditRoutes  from "./routes/audit.js";
import approveRoute from "./routes/approve.js";

const app = new Hono();

app.use("*", cors());
app.use("*", logger());
app.route("/", approveRoute);
app.route("/", statusRoutes);
app.route("/", payRoutes);
app.route("/", auditRoutes);

app.get("/", (c) => c.json({
  message: "OWS-MPP Payment Agent is running 🚀",
  docs: {
    status: "GET  /status",
    pay:    "POST /pay",
    audit:  "GET  /audit",
  }
}));

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`\n🚀 Aegis Autonopay running → http://localhost:${info.port}\n`);
});
