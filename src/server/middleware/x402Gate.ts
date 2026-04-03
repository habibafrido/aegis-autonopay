import { createMiddleware } from "hono/factory";

export const x402Gate = createMiddleware(async (c, next) => {
  // x402 seller-side gate
  // In production: verify x402 payment header before serving resource
  // const paymentHeader = c.req.header("X-Payment");
  // if (!paymentHeader) return c.json({ error: "Payment required" }, 402);
  await next();
});