import type { PaymentRequest } from "../policy/engine.js";

export type PaymentRail = "x402" | "mpp-charge" | "mpp-session";

export interface PaymentResult {
  rail: PaymentRail;
  txHash?: string;
  sessionId?: string;
  receipt: string;
  timestamp: number;
}

export function selectRail(req: PaymentRequest): PaymentRail {
  if (req.frequency === "streaming") return "mpp-session";
  if (req.amount > 10)              return "mpp-charge";
  return "x402";
}

export async function route(req: PaymentRequest): Promise<PaymentResult> {
  const rail = selectRail(req);
  console.log(`[Router] Selected rail: ${rail} for $${req.amount}`);

  switch (rail) {
    case "x402":        return await payX402(req);
    case "mpp-charge":  return await payMppCharge(req);
    case "mpp-session": return await payMppSession(req);
  }
}

// --- x402: Base micropayment ---
async function payX402(req: PaymentRequest): Promise<PaymentResult> {
  console.log(`[x402] Paying $${req.amount} to ${req.recipient}`);
  // TODO: integrate @x402/fetch + OWS signer
  return {
    rail: "x402",
    receipt: `x402:${Date.now()}:${req.amount}USDC`,
    timestamp: Date.now(),
  };
}

// --- MPP charge: Tempo one-shot ---
async function payMppCharge(req: PaymentRequest): Promise<PaymentResult> {
  console.log(`[MPP] Charging $${req.amount} to ${req.recipient}`);
  // TODO: integrate mppx + OWS signer
  return {
    rail: "mpp-charge",
    txHash: `0x${Math.random().toString(16).slice(2)}`,
    receipt: `mpp-charge:${Date.now()}:${req.amount}USDC`,
    timestamp: Date.now(),
  };
}

// --- MPP session: Tempo streaming ---
async function payMppSession(req: PaymentRequest): Promise<PaymentResult> {
  console.log(`[MPP] Opening session @ $${req.amount}/sec to ${req.recipient}`);
  // TODO: integrate mppx session + OWS signer
  return {
    rail: "mpp-session",
    sessionId: `session_${Date.now()}`,
    receipt: `mpp-session:${Date.now()}:${req.amount}USDC/s`,
    timestamp: Date.now(),
  };
}