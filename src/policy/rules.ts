import { getDefaultPolicy } from "../../config/policy.js";

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  requiresApproval: boolean;
}

export function evaluateRules(
  amount: number,
  dailySpent: number
): PolicyDecision {
  const policy = getDefaultPolicy();

  if (amount > policy.approvalThreshold) {
    return {
      allowed: false,
      reason: `Requires human approval (> $${policy.approvalThreshold})`,
      requiresApproval: true,
    };
  }

  if (amount > policy.spendLimitPerTx) {
    return {
      allowed: false,
      reason: `Exceeds per-tx limit ($${policy.spendLimitPerTx})`,
      requiresApproval: false,
    };
  }

  if (dailySpent + amount > policy.dailyCap) {
    return {
      allowed: false,
      reason: `Would exceed daily cap ($${policy.dailyCap})`,
      requiresApproval: false,
    };
  }

  return {
    allowed: true,
    reason: "All rules passed",
    requiresApproval: false,
  };
}