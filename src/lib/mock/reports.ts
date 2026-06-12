import type { CommandCenterMetrics, SystemHealth, DatabaseLedgerHealth } from '../types';

export const mockCommandCenterMetrics: CommandCenterMetrics = {
  totalAgentRuns: 24531,
  totalAgentRunsDelta: 18.7,
  highRiskRuns: 218,
  highRiskRunsDelta: -8.3,
  pendingApprovals: 12,
  pendingApprovalsDelta: 9,
  blockedActions: 1024,
  blockedActionsDelta: 24.1,
};

export const mockSystemHealth: SystemHealth = {
  agentsOnline: 128,
  agentsTotal: 128,
  eventIngestionRate: 2431,
  replayQueueDepth: 3,
  systemUptime: '30d',
  services: [
    { name: 'Event Ingestion', status: 'Healthy', latency: '12,842 events/min', details: 'Nominal' },
    { name: 'Policy Engine', status: 'Healthy', latency: '42ms avg', details: 'Nominal' },
    { name: 'Replay Service', status: 'Healthy', details: 'Idle' },
    { name: 'Memory Service', status: 'Healthy', details: '99.98% uptime' },
    { name: 'Audit Storage', status: 'Healthy', details: '18.2 TB / 100 TB' },
  ],
};

export const mockDatabaseLedgerHealth: DatabaseLedgerHealth = {
  integrity: 100,
  totalEvents: 18742931,
  lastCommit: '10:23:46',
  ledgerSize: '128.3 GB',
  committedRuns: 24531,
  immutability: 'ENFORCED',
  recentCheckpoints: [
    { timestamp: '10:23:46', blockId: 'Block 18,742,931' },
    { timestamp: '10:18:46', blockId: 'Block 18,742,765' },
    { timestamp: '10:13:46', blockId: 'Block 18,742,601' },
    { timestamp: '10:08:46', blockId: 'Block 18,742,438' },
  ],
};

export const mockRiskDistribution = [
  { name: 'Critical', value: 294, percentage: 1.2, color: '#DC2626' },
  { name: 'High', value: 1374, percentage: 5.6, color: '#EA580C' },
  { name: 'Medium', value: 3753, percentage: 15.3, color: '#CA8A04' },
  { name: 'Low', value: 19110, percentage: 77.9, color: '#16A34A' },
];

export const mockReplayQueue = [
  { agentName: 'RefundAgent v2.4.1', runId: 'run_96c7b2a1e4ed', status: 'QUEUED' as const },
  { agentName: 'FraudScreen v2.5.1', runId: 'run_3b8c0f2d5a77', status: 'QUEUED' as const },
  { agentName: 'KYCVerifier v3.2.0', runId: 'run_a1b2c3d4e5f6', status: 'QUEUED' as const },
  { agentName: 'ClaimsProcessor v1.8.3', runId: 'run_9f8e7d6c5b4', status: 'RUNNING' as const },
];
