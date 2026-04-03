import { enqueue } from "./queue.js"; 
import { PolicyEngine, type PaymentRequest } from "../policy/engine.js";
import { route } from "../payment/router.js";
import { AuditLogger } from "../audit/logger.js";

const policy = new PolicyEngine();
const audit  = new AuditLogger();

export async function processPayment(req: PaymentRequest) {
  console.log(`\n[Agent] ── New Payment Request ──`);
  console.log(`[Agent] Purpose : ${req.purpose}`);
  console.log(`[Agent] Amount  : $${req.amount}`);
  console.log(`[Agent] To      : ${req.recipient}`);

  const check = policy.evaluate(req);
  console.log(`[Policy] Decision: ${check.decision.toUpperCase()}${check.reason ? " — " + check.reason : ""}`);

  if (check.decision === "denied") {
    await audit.log({ ...req, status: "denied", reason: check.reason });
    return null;
  }

  if (check.decision === "warn") {
  const id = enqueue(req, check.reason!);
  await audit.log({ ...req, status: "pending", reason: check.reason });
  console.warn(`[Policy] ⚠️  Pending approval → POST /approve/${id}`);
  return null;
}

  const result = await route(req);
  policy.recordSpend(req.amount);

  await audit.log({ ...req, status: "success", ...result });

  const stats = policy.getStats();
  console.log(`[Agent] ✔ Done | Daily spent: $${stats.dailySpent}/$${stats.dailyCap}`);

  return result;
}