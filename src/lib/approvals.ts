import { mockApprovals } from './mock/approvals';
import type { ApprovalRequest } from './types';

/**
 * Compute the number of pending approvals from a given list.
 * Counts only records where status is PENDING, PENDING_APPROVAL, or REQUIRES_APPROVAL.
 */
export function computePendingApprovalsCount(approvals: ApprovalRequest[]): number {
  return approvals.filter((a) =>
    a.status === 'PENDING' || a.status === 'PENDING_APPROVAL' || a.status === 'REQUIRES_APPROVAL'
  ).length;
}

/**
 * Get the default approvals data source (mock or live, depending on availability).
 * Currently returns mock approvals.
 * In the future, this can be extended to fetch from /api/approvals.
 */
export function getApprovalsDataSource(): ApprovalRequest[] {
  // TODO: In the future, try /api/approvals first before falling back to mock
  return mockApprovals;
}

/**
 * Compute approval statistics from a given list.
 */
export function computeApprovalStats(approvals: ApprovalRequest[]) {
  return {
    pending: computePendingApprovalsCount(approvals),
    approved: approvals.filter((a) => a.status === 'APPROVED').length,
    denied: approvals.filter((a) => a.status === 'DENIED').length,
    total: approvals.length,
  };
}
