import { getDefaultPolicy, type Policy } from "../../config/policy.js";

export type PolicyDecision = "approved" | "warn" | "denied";

export interface PolicyResult {
  decision: PolicyDecision;
  reason?: string;
}

export interface PaymentRequest {
  amount: number;
  recipient: string;
  purpose: string;
  frequency?: "once" | "streaming";
}

export class PolicyEngine {
  private policy: Policy;
  private dailySpent = 0;
  private lastReset = Date.now();

  constructor(policy?: Policy) {
    this.policy = policy ?? getDefaultPolicy();  // ← pakai fungsi
  }

evaluate(req: PaymentRequest): PolicyResult {
  this.resetDailyIfNeeded();

  if (this.dailySpent + req.amount > this.policy.dailyCap)
    return { decision: "denied", reason: `Would exceed daily cap ($${this.policy.dailyCap})` };

  // Hard limit DULU sebelum warn threshold
  if (req.amount > this.policy.spendLimitPerTx)
    return { decision: "denied", reason: `Exceeds per-tx limit ($${this.policy.spendLimitPerTx})` };

  // Warn threshold setelah hard limit
  if (req.amount >= this.policy.approvalThreshold)
    return { decision: "warn", reason: `Amount $${req.amount} requires human approval` };

  if (
    this.policy.allowedRecipients.length > 0 &&
    !this.policy.allowedRecipients.includes(req.recipient)
  )
    return { decision: "denied", reason: "Recipient not in whitelist" };

  return { decision: "approved" };
}
  recordSpend(amount: number) {
    this.dailySpent += amount;
  }

  getStats() {
    return {
      dailySpent: this.dailySpent,
      dailyCap: this.policy.dailyCap,
      remaining: this.policy.dailyCap - this.dailySpent,
    };
  }

  private resetDailyIfNeeded() {
    if (Date.now() - this.lastReset > 86_400_000) {
      this.dailySpent = 0;
      this.lastReset = Date.now();
    }
  }
}