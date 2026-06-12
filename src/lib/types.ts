// AgentBlackbox — Core Type Definitions

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type RunStatus = 'COMPLETED' | 'FLAGGED' | 'BLOCKED' | 'PENDING_APPROVAL' | 'RUNNING' | 'FAILED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'DENIED';

export type EventType =
  | 'RUN_STARTED'
  | 'USER_REQUEST_RECEIVED'
  | 'MEMORY_READ'
  | 'CUSTOMER_PROFILE_READ'
  | 'TOOL_CALLED'
  | 'POLICY_CHECKED'
  | 'ACTION_ATTEMPTED'
  | 'POLICY_VIOLATION_DETECTED'
  | 'ACTION_BLOCKED'
  | 'HUMAN_APPROVAL_REQUESTED'
  | 'HUMAN_APPROVED'
  | 'HUMAN_DENIED'
  | 'ACTION_CANCELLED'
  | 'ACTION_EXECUTED'
  | 'MEMORY_UPDATED'
  | 'AUDIT_REPORT_GENERATED'
  | 'RUN_COMPLETED';

export interface AgentEvent {
  eventId: string;
  tenantId: string;
  agentId: string;
  agentName: string;
  runId: string;
  eventType: EventType;
  riskLevel: RiskLevel;
  status: string;
  action?: string;
  amount?: number;
  currency?: string;
  policyId?: string;
  timestamp: string;
  duration?: number;
  description?: string;
  payload?: Record<string, unknown>;
  // DynamoDB keys
  PK?: string;
  SK?: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  GSI3PK?: string;
  GSI3SK?: string;
}

export interface AgentRun {
  runId: string;
  tenantId: string;
  agentId: string;
  agentName: string;
  agentVersion: string;
  status: RunStatus;
  riskLevel: RiskLevel;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  totalEvents: number;
  policyViolations: number;
  blockedActions: number;
  humanInterventions: number;
  triggeredPolicies: number;
  customerId?: string;
  summary?: string;
}

export interface Agent {
  agentId: string;
  agentName: string;
  version: string;
  description: string;
  category: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  totalRuns: number;
  avgRiskScore: number;
  lastRunAt: string;
}

export interface ApprovalRequest {
  approvalId: string;
  tenantId: string;
  runId: string;
  agentId: string;
  agentName: string;
  action: string;
  affectedEntity: string;
  amount?: number;
  currency?: string;
  riskLevel: RiskLevel;
  policyReason: string;
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  approverGroup: string;
  note?: string;
  decisionNote?: string;
}

export interface Policy {
  policyId: string;
  name: string;
  rule: string;
  configuredLimit?: number | string;
  severity: RiskLevel;
  category: string;
  description: string;
  triggeredCount: number;
}

export interface CommandCenterMetrics {
  totalAgentRuns: number;
  totalAgentRunsDelta: number;
  highRiskRuns: number;
  highRiskRunsDelta: number;
  pendingApprovals: number;
  pendingApprovalsDelta: number;
  blockedActions: number;
  blockedActionsDelta: number;
}

export interface SystemHealth {
  agentsOnline: number;
  agentsTotal: number;
  eventIngestionRate: number;
  replayQueueDepth: number;
  systemUptime: string;
  services: {
    name: string;
    status: 'Healthy' | 'Degraded' | 'Down';
    latency?: string;
    details?: string;
  }[];
}

export interface DatabaseLedgerHealth {
  integrity: number;
  totalEvents: number;
  lastCommit: string;
  ledgerSize: string;
  committedRuns: number;
  immutability: 'ENFORCED' | 'PARTIAL';
  recentCheckpoints: { timestamp: string; blockId: string }[];
}

export interface MemoryDiff {
  before: Record<string, string | number | boolean>;
  after: Record<string, string | number | boolean>;
}

export interface TimelineEvent extends AgentEvent {
  label: string;
  detail: string;
}
