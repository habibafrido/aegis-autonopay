import { z } from "zod";

export const PolicyConfig = z.object({
  spendLimitPerTx:    z.number().default(5),
  dailyCap:           z.number().default(50),
  approvalThreshold:  z.number().default(20),
  allowedRecipients:  z.array(z.string()).default([]),
  allowedChains:      z.array(z.string()).default(["eip155:8453", "eip155:19012"]),
});

export type Policy = z.infer<typeof PolicyConfig>;

// Fungsi, bukan konstanta — dibaca fresh setiap kali dipanggil
export function getDefaultPolicy(): Policy {
  return PolicyConfig.parse({
    spendLimitPerTx:   Number(process.env.AGENT_SPEND_LIMIT_PER_TX ?? 5),
    dailyCap:          Number(process.env.AGENT_DAILY_CAP ?? 200),
    approvalThreshold: Number(process.env.HUMAN_APPROVAL_THRESHOLD ?? 50),
  });
}