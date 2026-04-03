export interface PendingApproval {
  id: string;
  amount: number;
  recipient: string;
  purpose: string;
  createdAt: number;
  status: "pending" | "approved" | "rejected";
}

const pendingApprovals = new Map<string, PendingApproval>();

export function createApprovalRequest(
  amount: number,
  recipient: string,
  purpose: string
): PendingApproval {
  const id = `approval_${Date.now()}`;
  const approval: PendingApproval = {
    id,
    amount,
    recipient,
    purpose,
    createdAt: Date.now(),
    status: "pending",
  };
  pendingApprovals.set(id, approval);
  console.log(`[Approval] ⏳ Pending human approval → ${id}`);
  return approval;
}

export function approveRequest(id: string): boolean {
  const approval = pendingApprovals.get(id);
  if (!approval) return false;
  approval.status = "approved";
  console.log(`[Approval] ✅ Approved → ${id}`);
  return true;
}

export function rejectRequest(id: string): boolean {
  const approval = pendingApprovals.get(id);
  if (!approval) return false;
  approval.status = "rejected";
  console.log(`[Approval] ❌ Rejected → ${id}`);
  return true;
}

export function getPendingApprovals(): PendingApproval[] {
  return [...pendingApprovals.values()].filter((a) => a.status === "pending");
}