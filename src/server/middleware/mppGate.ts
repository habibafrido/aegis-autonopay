import { createMiddleware } from "hono/factory";

export const mppGate = createMiddleware(async (c, next) => {
  // MPP seller-side gate
  // In production: verify active MPP session before serving resource
  // const sessionId = c.req.header("X-MPP-Session");
  // if (!sessionId) return c.json({ error: "MPP session required" }, 402);
  await next();
});