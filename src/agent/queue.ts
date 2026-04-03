import { route } from "../payment/router.js";
import { AuditLogger } from "../audit/logger.js";
import type { PaymentRequest } from "../policy/engine.js";

export interface PendingItem {
  id: string;
  req: PaymentRequest;
  reason: string;
  createdAt: string;
}

const audit = new AuditLogger();
const queue: Map<string, PendingItem> = new Map();

export function enqueue(req: PaymentRequest, reason: string): string {
  const id = `pending_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  queue.set(id, { id, req, reason, createdAt: new Date().toISOString() });
  console.log(`[Queue] Added pending: ${id}`);
  return id;
}

export function getPendingQueue(): PendingItem[] {
  return Array.from(queue.values());
}

export async function approvePending(id: string) {
  const item = queue.get(id);
  if (!item) return null;

  queue.delete(id);
  console.log(`[Queue] Approved: ${id}`);

  const result = await route(item.req);
  await audit.log({ ...item.req, status: "success", ...result });
  return result;
}

export function denyPending(id: string): boolean {
  const item = queue.get(id);
  if (!item) return false;

  queue.delete(id);
  console.log(`[Queue] Denied: ${id}`);
  audit.log({ ...item.req, status: "denied", reason: "Manually denied by human" });
  return true;
}