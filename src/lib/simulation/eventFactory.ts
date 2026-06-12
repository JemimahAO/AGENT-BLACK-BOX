import type { AgentEvent, EventType, RiskLevel } from '../types';

export interface SimulatedAgent {
  agentId: string;
  agentName: string;
  version: string;
  riskProfile: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scenarios: ScenarioType[];
}

export type ScenarioType =
  | 'normal_refund'
  | 'blocked_refund'
  | 'kyc_check'
  | 'suspicious_kyc'
  | 'claims_access'
  | 'sensitive_claims'
  | 'sales_export'
  | 'data_exfiltration'
  | 'hr_onboarding'
  | 'fraud_detection'
  | 'fraud_escalation';

export const simulatedAgents: SimulatedAgent[] = [
  {
    agentId: 'refund-agent',
    agentName: 'RefundAgent',
    version: 'v2.7.4',
    riskProfile: 'HIGH',
    scenarios: ['normal_refund', 'blocked_refund'],
  },
  {
    agentId: 'kyc-verifier',
    agentName: 'KYCVerifier',
    version: 'v3.2.0',
    riskProfile: 'MEDIUM',
    scenarios: ['kyc_check', 'suspicious_kyc'],
  },
  {
    agentId: 'claims-processor',
    agentName: 'ClaimsProcessor',
    version: 'v1.8.3',
    riskProfile: 'HIGH',
    scenarios: ['claims_access', 'sensitive_claims'],
  },
  {
    agentId: 'sales-data-agent',
    agentName: 'SalesDataAgent',
    version: 'v3.1.0',
    riskProfile: 'CRITICAL',
    scenarios: ['sales_export', 'data_exfiltration'],
  },
  {
    agentId: 'hr-onboarding',
    agentName: 'HROnboardingAgent',
    version: 'v1.4.1',
    riskProfile: 'LOW',
    scenarios: ['hr_onboarding'],
  },
  {
    agentId: 'fraud-screen',
    agentName: 'FraudScreen',
    version: 'v2.5.1',
    riskProfile: 'HIGH',
    scenarios: ['fraud_detection', 'fraud_escalation'],
  },
];

export type SimScenario = {
  type: ScenarioType;
  events: Array<{
    eventType: EventType;
    riskLevel: RiskLevel;
    status: string;
    action?: string;
    amount?: number;
    currency?: string;
    description: string;
    detail: string;
  }>;
};

export const scenarioDefinitions: Record<ScenarioType, SimScenario> = {
  normal_refund: {
    type: 'normal_refund',
    events: [
      { eventType: 'RUN_STARTED', riskLevel: 'INFO', status: 'OK', description: 'RefundAgent initialized', detail: 'Agent started for refund request' },
      { eventType: 'USER_REQUEST_RECEIVED', riskLevel: 'INFO', status: 'OK', description: 'Customer requested refund', detail: 'Refund request received' },
      { eventType: 'POLICY_CHECKED', riskLevel: 'LOW', status: 'PASS', description: 'Refund within policy limits', detail: 'Amount: $85 — within $500 limit' },
      { eventType: 'ACTION_EXECUTED', riskLevel: 'LOW', status: 'OK', action: 'ProcessRefund', amount: 85, currency: 'USD', description: 'Refund executed', detail: '$85 refund processed' },
      { eventType: 'RUN_COMPLETED', riskLevel: 'LOW', status: 'COMPLETED', description: 'Run completed successfully', detail: 'Refund completed' },
    ],
  },
  blocked_refund: {
    type: 'blocked_refund',
    events: [
      { eventType: 'RUN_STARTED', riskLevel: 'INFO', status: 'OK', description: 'RefundAgent initialized', detail: 'Agent started for high-value refund' },
      { eventType: 'POLICY_CHECKED', riskLevel: 'CRITICAL', status: 'VIOLATION', description: 'Policy violation detected', detail: 'Amount exceeds limit' },
      { eventType: 'ACTION_BLOCKED', riskLevel: 'CRITICAL', status: 'BLOCKED', action: 'ProcessRefund', amount: 3200, currency: 'USD', description: 'Refund blocked by policy', detail: '$3,200 refund blocked' },
      { eventType: 'HUMAN_APPROVAL_REQUESTED', riskLevel: 'HIGH', status: 'PENDING', description: 'Escalated to Finance Team', detail: 'Awaiting human approval' },
    ],
  },
  kyc_check: {
    type: 'kyc_check',
    events: [
      { eventType: 'RUN_STARTED', riskLevel: 'INFO', status: 'OK', description: 'KYCVerifier initialized', detail: 'Identity verification started' },
      { eventType: 'TOOL_CALLED', riskLevel: 'LOW', status: 'OK', action: 'DocumentVerify', description: 'Document scan tool called', detail: 'Scanning ID document' },
      { eventType: 'RUN_COMPLETED', riskLevel: 'INFO', status: 'COMPLETED', description: 'Identity verified', detail: 'KYC check passed' },
    ],
  },
  suspicious_kyc: {
    type: 'suspicious_kyc',
    events: [
      { eventType: 'RUN_STARTED', riskLevel: 'INFO', status: 'OK', description: 'KYCVerifier initialized', detail: 'Identity verification started' },
      { eventType: 'POLICY_VIOLATION_DETECTED', riskLevel: 'HIGH', status: 'FLAGGED', description: 'Suspicious document detected', detail: 'Fraud score: 0.89' },
      { eventType: 'ACTION_BLOCKED', riskLevel: 'HIGH', status: 'BLOCKED', action: 'ApproveIdentity', description: 'Identity approval blocked', detail: 'Document flagged for manual review' },
    ],
  },
  claims_access: {
    type: 'claims_access',
    events: [
      { eventType: 'RUN_STARTED', riskLevel: 'INFO', status: 'OK', description: 'ClaimsProcessor initialized', detail: 'Claim review started' },
      { eventType: 'CUSTOMER_PROFILE_READ', riskLevel: 'LOW', status: 'OK', description: 'Claim profile loaded', detail: 'Customer profile retrieved' },
      { eventType: 'RUN_COMPLETED', riskLevel: 'LOW', status: 'COMPLETED', description: 'Claim processed', detail: 'Claim approved and processed' },
    ],
  },
  sensitive_claims: {
    type: 'sensitive_claims',
    events: [
      { eventType: 'RUN_STARTED', riskLevel: 'INFO', status: 'OK', description: 'ClaimsProcessor initialized', detail: 'Sensitive claim review' },
      { eventType: 'HUMAN_APPROVAL_REQUESTED', riskLevel: 'HIGH', status: 'PENDING', description: 'Medical record access requires approval', detail: 'HIPAA policy triggered' },
    ],
  },
  sales_export: {
    type: 'sales_export',
    events: [
      { eventType: 'RUN_STARTED', riskLevel: 'INFO', status: 'OK', description: 'SalesDataAgent initialized', detail: 'Sales analysis started' },
      { eventType: 'TOOL_CALLED', riskLevel: 'LOW', status: 'OK', action: 'QuerySalesDB', description: 'Sales database queried', detail: 'Retrieving Q2 pipeline data' },
      { eventType: 'RUN_COMPLETED', riskLevel: 'LOW', status: 'COMPLETED', description: 'Sales report generated', detail: 'Report exported successfully' },
    ],
  },
  data_exfiltration: {
    type: 'data_exfiltration',
    events: [
      { eventType: 'RUN_STARTED', riskLevel: 'INFO', status: 'OK', description: 'SalesDataAgent initialized', detail: 'Data export started' },
      { eventType: 'POLICY_VIOLATION_DETECTED', riskLevel: 'CRITICAL', status: 'VIOLATION', description: 'Unauthorized endpoint detected', detail: 'data-sync[.]info not in approved list' },
      { eventType: 'ACTION_BLOCKED', riskLevel: 'CRITICAL', status: 'BLOCKED', action: 'ExportCustomerData', description: 'Data exfiltration blocked', detail: 'Transmission to external endpoint blocked' },
    ],
  },
  hr_onboarding: {
    type: 'hr_onboarding',
    events: [
      { eventType: 'RUN_STARTED', riskLevel: 'INFO', status: 'OK', description: 'HROnboardingAgent initialized', detail: 'Onboarding workflow started' },
      { eventType: 'MEMORY_READ', riskLevel: 'INFO', status: 'OK', description: 'Employee records accessed', detail: 'Reading onboarding checklist' },
      { eventType: 'ACTION_EXECUTED', riskLevel: 'INFO', status: 'OK', action: 'ProvisionAccess', description: 'Access provisioned', detail: 'Employee access granted' },
      { eventType: 'RUN_COMPLETED', riskLevel: 'INFO', status: 'COMPLETED', description: 'Onboarding completed', detail: 'All steps completed successfully' },
    ],
  },
  fraud_detection: {
    type: 'fraud_detection',
    events: [
      { eventType: 'RUN_STARTED', riskLevel: 'INFO', status: 'OK', description: 'FraudScreen initialized', detail: 'Transaction screening started' },
      { eventType: 'TOOL_CALLED', riskLevel: 'LOW', status: 'OK', action: 'MLFraudScore', description: 'ML model invoked', detail: 'Scoring transaction pattern' },
      { eventType: 'ACTION_EXECUTED', riskLevel: 'MEDIUM', status: 'FLAGGED', action: 'FlagTransaction', description: 'Transaction flagged', detail: 'Unusual pattern detected' },
    ],
  },
  fraud_escalation: {
    type: 'fraud_escalation',
    events: [
      { eventType: 'RUN_STARTED', riskLevel: 'INFO', status: 'OK', description: 'FraudScreen initialized', detail: 'High-value transaction screening' },
      { eventType: 'POLICY_VIOLATION_DETECTED', riskLevel: 'HIGH', status: 'VIOLATION', description: 'High-risk transaction detected', detail: 'Multiple fraud signals triggered' },
      { eventType: 'HUMAN_APPROVAL_REQUESTED', riskLevel: 'HIGH', status: 'PENDING', description: 'Fraud alert escalated', detail: 'Risk team notified' },
    ],
  },
};

let eventCounter = 100;

export function generateSimulatedEvent(
  agent: SimulatedAgent,
  scenario: SimScenario,
  eventDef: SimScenario['events'][0],
): AgentEvent {
  const runId = `run_sim_${Math.random().toString(36).slice(2, 10)}`;
  const eventId = `evt_sim_${(++eventCounter).toString().padStart(6, '0')}`;
  const now = new Date().toISOString();

  return {
    eventId,
    tenantId: 'demo',
    agentId: agent.agentId,
    agentName: agent.agentName,
    runId,
    eventType: eventDef.eventType,
    riskLevel: eventDef.riskLevel,
    status: eventDef.status,
    action: eventDef.action,
    amount: eventDef.amount,
    currency: eventDef.currency,
    timestamp: now,
    duration: Math.floor(Math.random() * 500) + 10,
    description: eventDef.description,
    payload: {
      agentVersion: agent.version,
      scenario: scenario.type,
      detail: eventDef.detail,
    },
    PK: `TENANT#demo`,
    SK: `RUN#${runId}#EVENT#${now}#${eventId}`,
    GSI1PK: `TENANT#demo#AGENT#${agent.agentId}`,
    GSI1SK: `TIMESTAMP#${now}`,
    GSI2PK: `TENANT#demo#RISK#${eventDef.riskLevel}`,
    GSI2SK: `TIMESTAMP#${now}`,
    GSI3PK: `TENANT#demo#STATUS#${eventDef.status}`,
    GSI3SK: `TIMESTAMP#${now}`,
  };
}

export function pickRandomScenario(agent: SimulatedAgent): SimScenario {
  const idx = Math.floor(Math.random() * agent.scenarios.length);
  return scenarioDefinitions[agent.scenarios[idx]];
}

export function pickRandomAgent(): SimulatedAgent {
  const idx = Math.floor(Math.random() * simulatedAgents.length);
  return simulatedAgents[idx];
}
