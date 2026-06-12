# Requirements Document

## 1. Application Overview

**Application Name:** AgentBlackbox

**Application Description:** AgentBlackbox is a B2B AI-agent governance, observability, and audit platform designed for the H0 Hackathon Track 2 (Monetizable B2B App). It functions as a flight recorder for existing AI agents, enabling companies to connect their already-built AI agents and record every run, memory read, tool call, policy check, approval request, blocked action, human decision, final action, and memory update into a replayable event ledger.

**Core Tagline:** Replay the failure. Prove the truth.

**Main Pitch:** AgentBlackbox helps teams safely deploy autonomous AI agents by making every agent action replayable, auditable, and governed through a DynamoDB event ledger.

**Product Positioning:** This is not an AI agent builder. It is the monitoring, audit, replay, and governance layer for existing agents.

**Design Direction:** Blackbox/incident-forensics/flight-recorder visual system with matte black and deep navy background, controlled orange/amber blackbox-recorder accents, critical red for risk and policy violations, electric blue for secondary technical highlights, emerald green for healthy states, glassmorphism cards, subtle glow, premium enterprise typography, cinematic but serious aesthetic, polished spacing and hierarchy. The app should feel like an AI flight recorder, incident forensics console, elite AI security mission control, and premium enterprise infrastructure product.

---

## 2. Users and Usage Scenarios

**Target Users:**
- B2B enterprise teams deploying autonomous AI agents
- Compliance and audit teams requiring agent action traceability
- Engineering teams debugging AI agent failures
- Risk management teams monitoring high-risk agent actions
- Finance, healthcare, insurance, SaaS, and fintech companies using AI agents for refunds, claims processing, KYC verification, fraud detection, HR onboarding, and sales data analysis

**Core Usage Scenarios:**
- Replay failed agent runs to reconstruct what memory, tool call, policy check, or approval caused the failure
- Monitor live agent activity through a command center dashboard
- Review and approve high-risk agent actions requiring human intervention
- Generate audit reports for compliance and incident response
- Integrate existing AI agents to send structured run events to AgentBlackbox
- Understand database architecture and access patterns for event ledger queries

---

## 3. Page Structure and Functional Description

### Page Hierarchy

```
AgentBlackbox
├── Landing Page
├── Command Center
├── Run Replay
├── Approvals
├── Integrations
├── Database Architecture
└── Settings
```

### 3.1 Landing Page

**Purpose:** Introduce AgentBlackbox value proposition and guide users to core features.

**Hero Section:**
- Hero title: Flight recorder for AI agents
- Subtitle: Replay, govern, and audit every AI agent action before it becomes a production incident.
- Primary button: Open Command Center
- Secondary button: Replay Demo Incident

**Content Sections:**
1. **The Problem:** Explain that autonomous agents fail autonomously, and teams cannot reconstruct what memory, tool call, policy check, or approval caused the failure.
2. **How AgentBlackbox Works:** Describe that existing agents send structured run events to AgentBlackbox, and the event ledger stores and makes them replayable.
3. **Why AI Agents Need Audit Trails:** Highlight compliance, debugging, incident response, and human-in-the-loop governance.
4. **Database-First Architecture:** Introduce DynamoDB event ledger, single-table design, and query-optimized replay.
5. **B2B Use Cases:** List fintech refund agents, healthcare admin agents, insurance claim agents, SaaS support agents, internal automation agents, and KYC/fraud agents.

---

### 3.2 Command Center

**Purpose:** Provide real-time monitoring dashboard for agent activity, incidents, and system health.

**Header:**
- Blackbox-style header with application branding

**Active Incident Banner:**
- Display critical incident: Sensitive Data Exfiltration Attempt
- Incident ID: INC-2026-06-09-00073
- Agent: SalesDataAgent v3.1.0
- Status: Investigation Open
- Risk Level: Critical
- Detected: 2 minutes ago
- Description: Agent attempted to transmit sensitive customer data to an unauthorized external endpoint.
- Buttons: Investigate Now, Open Run Replay

**Simulation Control:**
- Start Live Simulation button: When clicked, begin showing new live events every 1–2 seconds using local state/mock data. The simulation should make the app feel alive with live event feed updates, metrics updates, recent runs updates, critical incident appearances, replay queue updates, and approval queue changes.

**Metrics Cards:**
- Total Agent Runs card
- High-Risk Runs card
- Pending Approvals card
- Blocked Actions card

**Recent Agent Runs Table:**
- Columns: Time, Agent, Run ID, Status, Risk, Policies Triggered, Action (Replay button)
- Statuses: Completed, Flagged, Blocked, Pending Approval
- Risk levels: Info, Low, Medium, High, Critical

**Live Event Feed:**
- Display real-time event stream during simulation

**Additional Panels:**
- Risk Distribution or Incident Heat panel
- Database Ledger Health card
- System Health card
- Replay Queue card

---

### 3.3 Run Replay

**Purpose:** Reconstruct and analyze agent runs step-by-step with full context and state. This is the flagship screen.

**Page Title:** Run Replay

**Subtitle:** Reconstruct and analyze agent runs step-by-step with full context and state.

**Main Incident:** Refund Agent Attempted an Unauthorized $4,800 Refund

**Hero Incident Banner:**
- Critical Incident Replay
- Risk level: Critical
- Risk score: 98/100
- Run ID: run_8f3a1a2b
- Agent: RefundAgent v2.7.4
- Customer: user_9c7f2d
- Time: 14:31:18 UTC
- Buttons: Replay Run, Generate Audit Report

**Main Layout:**
1. **Left Panel:** Glowing vertical event timeline
2. **Center Panel:** Event detail inspector
3. **Right Top Panel:** JSON action payload viewer
4. **Right Middle Panel:** Policy violation evidence card
5. **Bottom Left Panel:** Memory state diff
6. **Bottom Right Panel:** Human approval status
7. **Bottom Summary Bar:** Run duration, total events, policy violations, blocked actions, human interventions

**Timeline Events:**
- RUN_STARTED
- USER_REQUEST_RECEIVED
- MEMORY_READ
- CUSTOMER_PROFILE_READ
- TOOL_CALLED
- POLICY_CHECKED
- ACTION_ATTEMPTED
- POLICY_VIOLATION_DETECTED
- ACTION_BLOCKED
- HUMAN_APPROVAL_REQUESTED
- HUMAN_DENIED
- ACTION_CANCELLED
- AUDIT_REPORT_GENERATED

**Selected Event: ACTION_ATTEMPTED**

**Event Detail Inspector:**
- Event Type: ACTION_ATTEMPTED
- Timestamp: 14:31:18.456
- Agent: RefundAgent v2.7.4
- Action: ProcessRefund
- Target: Order #A10293
- Amount: $4,800.00 USD
- Status: Blocked
- Duration: 1.248s
- Event ID: evt_9f7a2b1c4d5e
- Explanation: The refund amount exceeded the configured approval limit of $500 and was automatically blocked by policy enforcement.

**JSON Payload Viewer:**
```json
{
  \"action\": \"ProcessRefund\",
  \"parameters\": {
    \"orderId\": \"A10293\",
    \"amount\": 4800,
    \"currency\": \"USD\",
    \"reason\": \"Product not as described\",
    \"refundMethod\": \"original_payment_method\"
  },
  \"agent\": \"RefundAgent v2.7.4\",
  \"sessionId\": \"sess_3b7f9c2a\",
  \"timestamp\": \"2026-06-09T14:31:18.456Z\"
}
```

**Policy Violation Evidence Card:**
- Policy: refund.amount.limit
- Rule: amount <= 500
- Configured Limit: $500
- Attempted Amount: $4,800
- Severity: Critical
- Policy ID: pol_7c9d2e1f

**Memory State Diff:**
- Before:
  + user.trust_score: 0.82
  + agent.authority_level: 500
  + session.refund_count: 1
  + order.status: delivered
- After:
  + order.refund_attempted: 4800
  + risk.score: 98
  + audit.flagged: true
  + escalation.required: true

**Human Approval Status:**
- Status: Denied
- Requested by: Policy Engine
- Approver group: Finance Team
- Decision note: Refund denied because it exceeded the agent authority limit.

**Replay Interaction:**
- Replay Run button: Visually step through timeline events
- Timeline items: Clickable and update the inspector, JSON viewer, policy card, memory diff, and status panels when selected

---

### 3.4 Approvals

**Purpose:** High-risk human review queue for agent actions requiring approval.

**Approval Queue Table:**
- Columns: Agent name, Requested action, Affected customer/user, Amount or data involved, Risk level, Policy reason, Status, Approve button, Deny button, Note field

**Sample Cases:**
1. **Pending:**
   - Agent: ClaimsProcessor
   - Action: Access medical claim history
   - Risk: High
   - Reason: Sensitive health data requires review
2. **Denied:**
   - Agent: RefundAgent
   - Action: Process $4,800 refund
   - Risk: Critical
   - Reason: Refund exceeded $500 authority limit
3. **Approved:**
   - Agent: SupportAgent
   - Action: Customer order lookup
   - Risk: Low
   - Reason: Normal support workflow

**Approval Actions:**
- When a user approves or denies a pending case, update the card status and add a visible event to the live event feed or local mock data.

---

### 3.5 Integrations

**Purpose:** Enable users to connect existing AI agents to AgentBlackbox.

**Page Title:** Connect Existing Agents

**Subtitle:** Send structured agent events to AgentBlackbox from any AI workflow.

**API Endpoint:**
- POST /api/events

**API Key:**
- Display API key placeholder

**SDK Snippet Tabs:**
- JavaScript snippet:
```js
await blackbox.logEvent({
  tenantId: \"acme\",
  runId: \"run_10482\",
  agentId: \"refund-agent\",
  eventType: \"TOOL_CALLED\",
  action: \"ProcessRefund\",
  riskLevel: \"HIGH\",
  payload: { amount: 4800, currency: \"USD\", orderId: \"A10293\" }
})
```
- Python snippet:
```python
blackbox.log_event({
  \"tenantId\": \"acme\",
  \"runId\": \"run_10482\",
  \"agentId\": \"refund-agent\",
  \"eventType\": \"TOOL_CALLED\",
  \"action\": \"ProcessRefund\",
  \"riskLevel\": \"HIGH\",
  \"payload\": { \"amount\": 4800, \"currency\": \"USD\", \"orderId\": \"A10293\" }
})
```

**Supported Agent Types:**
- LangChain
- CrewAI
- OpenAI workflows
- Custom backend agents
- n8n/Zapier-style automations
- Customer support bots
- Internal workflow agents

**Additional Features:**
- Send Test Event button
- Last Received Event card
- Ingestion status
- Event schema card

---

### 3.6 Database Architecture

**Purpose:** Explain the DynamoDB single-table event ledger design and access patterns.

**Page Title:** Database Architecture

**Subtitle:** AgentBlackbox uses a DynamoDB single-table event ledger for immutable, query-optimized auditability.

**Visual Flow:**
- Frontend on Vercel → Next.js Route Handlers → AWS SDK → Amazon DynamoDB → Event Replay UI

**Table Design:**
- Table name: AgentBlackboxEvents
- Primary key:
  + PK = TENANT#<tenantId>
  + SK = RUN#<runId>#EVENT#<timestamp>#<eventId>

**GSI Cards:**
1. **GSI1 — Agent Timeline:**
   - GSI1PK = TENANT#<tenantId>#AGENT#<agentId>
   - GSI1SK = TIMESTAMP#<timestamp>
   - Used for: Fetch events by agent
2. **GSI2 — Risk Dashboard:**
   - GSI2PK = TENANT#<tenantId>#RISK#<riskLevel>
   - GSI2SK = TIMESTAMP#<timestamp>
   - Used for: Fetch high-risk events
3. **GSI3 — Approval Queue:**
   - GSI3PK = TENANT#<tenantId>#STATUS#<status>
   - GSI3SK = TIMESTAMP#<timestamp>
   - Used for: Fetch pending approvals

**Access-Pattern Matrix:**
- Run Replay → Fetch full run timeline → Table PK/SK query
- Command Center → Fetch critical events → GSI2
- Approval Queue → Fetch pending approvals → GSI3
- Agent History → Fetch events by agent → GSI1
- Audit Report → Export run events → Table PK/SK query
- Live Feed → Fetch recent events → timestamp ordered event stream

**Sample Event Record:**
```json
{
  \"PK\": \"TENANT#demo\",
  \"SK\": \"RUN#run_8f3a1a2b#EVENT#2026-06-09T14:31:18.456Z#evt_9f7a\",
  \"GSI1PK\": \"TENANT#demo#AGENT#refund-agent\",
  \"GSI1SK\": \"TIMESTAMP#2026-06-09T14:31:18.456Z\",
  \"GSI2PK\": \"TENANT#demo#RISK#CRITICAL\",
  \"GSI2SK\": \"TIMESTAMP#2026-06-09T14:31:18.456Z\",
  \"GSI3PK\": \"TENANT#demo#STATUS#BLOCKED\",
  \"GSI3SK\": \"TIMESTAMP#2026-06-09T14:31:18.456Z\",
  \"eventType\": \"ACTION_ATTEMPTED\",
  \"riskLevel\": \"CRITICAL\",
  \"status\": \"BLOCKED\",
  \"amount\": 4800
}
```

**Visual Cards:**
- No scans required
- Query-optimized access patterns
- Multi-tenant partitioning
- Event replay by sort key ordering
- Human approval via sparse status index
- High-risk event dashboard via risk index

---

### 3.7 Settings

**Purpose:** Display system configuration and connection status.

**DynamoDB Connection Status:**
- Table name: AgentBlackboxEvents
- AWS region
- Environment variable checklist
- Last successful write

**Data Management:**
- Seed demo data button
- Clear local demo data button

**API Route Checklist:**
- /api/events
- /api/runs
- /api/runs/[runId]
- /api/approvals
- /api/reports
- /api/simulate

**Mode Indicator:**
- If real API routes are not fully connected, show UI as ready and mark as mock mode active.

---

## 4. Business Rules and Logic

### 4.1 Event Ledger Rules

**Event Stream Types:**
- RUN_STARTED
- USER_REQUEST_RECEIVED
- MEMORY_READ
- CUSTOMER_PROFILE_READ
- TOOL_CALLED
- POLICY_CHECKED
- ACTION_ATTEMPTED
- POLICY_VIOLATION_DETECTED
- ACTION_BLOCKED
- HUMAN_APPROVAL_REQUESTED
- HUMAN_APPROVED
- HUMAN_DENIED
- ACTION_CANCELLED
- ACTION_EXECUTED
- MEMORY_UPDATED
- AUDIT_REPORT_GENERATED
- RUN_COMPLETED

**Event Shape:**
```json
{
  \"tenantId\": \"demo\",
  \"agentId\": \"refund-agent\",
  \"agentName\": \"RefundAgent\",
  \"runId\": \"run_8f3a1a2b\",
  \"eventType\": \"ACTION_ATTEMPTED\",
  \"riskLevel\": \"CRITICAL\",
  \"status\": \"BLOCKED\",
  \"action\": \"ProcessRefund\",
  \"amount\": 4800,
  \"currency\": \"USD\",
  \"policyId\": \"refund.amount.limit\",
  \"timestamp\": \"2026-06-09T14:31:18.456Z\",
  \"payload\": {
    \"orderId\": \"A10293\",
    \"customerId\": \"user_9c7f2d\",
    \"reason\": \"Product not as described\"
  }
}
```

### 4.2 Simulation Engine Rules

**Simulated Agents:**
1. **RefundAgent:** Attempts refunds, sometimes violates refund limits, can trigger blocked actions and human approval
2. **KYCVerifier:** Checks user identity, sometimes flags suspicious documents
3. **ClaimsProcessor:** Handles insurance/medical claim reviews, sometimes requests sensitive record access
4. **SalesDataAgent:** Analyzes/export sales data, sometimes triggers data exfiltration attempt
5. **HR Onboarding Agent:** Reads employee records, usually low-risk but must be logged
6. **FraudScreen:** Detects suspicious transactions, often produces high-risk alerts

**Simulation Behavior:**
- When Start Live Simulation button is clicked, begin showing new live events every 1–2 seconds
- Update live event feed, metrics, recent runs, critical incidents, replay queue, and approval queue
- Events can later be sent to POST /api/events if backend route handlers are included

### 4.3 Risk Level Classification

**Risk Levels:**
- Info
- Low
- Medium
- High
- Critical

**Risk Score:** Numeric value from 0 to 100

### 4.4 Approval Workflow

**Approval Statuses:**
- Pending
- Approved
- Denied

**Approval Actions:**
- User can approve or deny pending cases
- Approval decision updates card status
- Approval decision adds visible event to live event feed

### 4.5 Policy Enforcement

**Policy Structure:**
- Policy ID
- Policy name
- Rule definition
- Configured limit
- Severity level

**Policy Violation Handling:**
- When agent action violates policy, action is blocked
- Policy violation event is logged
- Human approval may be requested

---

## 5. Exceptions and Edge Cases

| Scenario | Handling |  
|----------|----------|  
| Agent attempts action exceeding authority limit | Action is blocked, policy violation event is logged, human approval is requested |  
| Agent attempts to access sensitive data | Action requires human review, approval queue is updated |  
| Agent run fails mid-execution | All events up to failure point are logged, run status is marked as failed |  
| User denies approval request | Action is cancelled, denial event is logged, agent run is terminated |  
| User approves approval request | Action is executed, approval event is logged, agent run continues |  
| Simulation is started while already running | Existing simulation continues, no duplicate simulation is started |  
| User clicks Replay Run on timeline | Timeline events are visually stepped through, inspector panels update accordingly |  
| User clicks timeline event | Selected event updates inspector, JSON viewer, policy card, memory diff, and status panels |  
| User clicks Generate Audit Report | UI state changes or generated report confirmation is shown |  
| API routes are not connected | UI shows mock mode active, data is served from local mock data |  
| User sends test event from Integrations page | Last Received Event card is updated, ingestion status is updated |  

---

## 6. Acceptance Criteria

1. User opens Landing Page and sees hero title, subtitle, and two buttons (Open Command Center, Replay Demo Incident).
2. User clicks Open Command Center and is navigated to Command Center page.
3. User sees Command Center with active incident banner, metrics cards, recent agent runs table, and Start Live Simulation button.
4. User clicks Start Live Simulation and observes live event feed updating every 1–2 seconds with new events.
5. User clicks Open Run Replay from active incident banner and is navigated to Run Replay page.
6. User sees Run Replay page with hero incident banner, vertical event timeline, event detail inspector, JSON payload viewer, policy violation evidence card, memory state diff, and human approval status.
7. User clicks Replay Run button and observes timeline events being visually stepped through.
8. User clicks a timeline event and observes inspector, JSON viewer, policy card, memory diff, and status panels updating accordingly.
9. User navigates to Approvals page and sees high-risk human review queue with pending, denied, and approved cases.
10. User clicks Approve or Deny button on a pending case and observes card status updating and event appearing in live event feed.
11. User navigates to Integrations page and sees API endpoint, API key placeholder, SDK snippet tabs (JavaScript and Python), supported agent types, Send Test Event button, Last Received Event card, ingestion status, and event schema card.
12. User navigates to Database Architecture page and sees visual flow, table design, GSI cards, access-pattern matrix, sample event record, and visual cards explaining database design.
13. User navigates to Settings page and sees DynamoDB connection status, table name, AWS region, environment variable checklist, last successful write, seed demo data button, clear local demo data button, and API route checklist.
14. User observes that all pages are responsive and look intentional on both desktop and mobile.
15. User confirms that the app uses matte black and deep navy background, controlled orange/amber blackbox-recorder accents, critical red for risk, electric blue for secondary highlights, emerald green for healthy states, glassmorphism cards, subtle glow, premium enterprise typography, and polished spacing and hierarchy.

---

## 7. Out of Scope for This Release

- Real-time WebSocket connections for live event streaming
- User authentication and multi-tenant access control
- Role-based permissions for approval workflows
- Advanced filtering and search across event ledger
- Custom policy rule builder
- Integration with third-party incident management tools (PagerDuty, Opsgenie)
- Export audit reports to PDF or CSV
- Agent performance analytics and trend analysis
- Automated alerting and notification system
- Agent version comparison and diff view
- Multi-language support beyond English
- Dark mode toggle (design is already dark by default)
- Agent SDK packages published to npm or PyPI
- Real AWS DynamoDB connection and AWS SDK integration
- Production-ready error handling and retry logic
- Rate limiting and API throttling
- Data retention policies and archival
- Compliance certifications (SOC 2, GDPR, HIPAA)
- Agent health monitoring and uptime tracking
- Custom dashboard widgets and layout customization