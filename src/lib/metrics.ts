import type { AgentRun, ApprovalRequest, RiskLevel } from './types';

/**
 * Compute metrics from mock data
 */

export function getTotalActiveRuns(runs: AgentRun[]): number {
  return runs.filter(run => 
    run.status === 'RUNNING' || 
    run.status === 'PENDING_APPROVAL'
  ).length;
}

export function getHighRiskRunsCount(runs: AgentRun[]): number {
  return runs.filter(run => 
    run.riskLevel === 'CRITICAL' || 
    run.riskLevel === 'HIGH'
  ).length;
}

export function getBlockedActionsCount(runs: AgentRun[]): number {
  return runs.reduce((sum, run) => sum + (run.blockedActions || 0), 0);
}

export function getPendingApprovalsCount(approvals: ApprovalRequest[]): number {
  return approvals.filter(approval => approval.status === 'PENDING').length;
}

export function getHighestSeverityRun(runs: AgentRun[]): AgentRun | null {
  const riskPriority: Record<RiskLevel, number> = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    INFO: 1,
  };

  let highestRun: AgentRun | null = null;
  let highestPriority = 0;

  for (const run of runs) {
    const priority = riskPriority[run.riskLevel];
    if (priority > highestPriority) {
      highestPriority = priority;
      highestRun = run;
    }
  }

  return highestRun;
}

export function getRiskDistribution(runs: AgentRun[]): Record<RiskLevel, number> {
  const distribution: Record<RiskLevel, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0,
  };

  for (const run of runs) {
    distribution[run.riskLevel]++;
  }

  return distribution;
}

export function getCompletedRunsCount(runs: AgentRun[]): number {
  return runs.filter(run => run.status === 'COMPLETED').length;
}

export function getTotalRunsCount(runs: AgentRun[]): number {
  return runs.length;
}

export function getAverageRunDuration(runs: AgentRun[]): number {
  const completedRuns = runs.filter(run => run.duration !== undefined);
  if (completedRuns.length === 0) return 0;
  const totalDuration = completedRuns.reduce((sum, run) => sum + (run.duration || 0), 0);
  return Math.round(totalDuration / completedRuns.length);
}
