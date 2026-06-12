# AgentBlackbox

**The event ledger for AI agents.**

AgentBlackbox is an AI-agent governance, observability, and audit platform. It works like a **flight recorder for existing AI agents**. Companies can connect their already-built agents and record every run, memory read, tool call, policy check, approval request, blocked action, human decision, final action, and memory update into a replayable event ledger.

**Record, replay, and govern autonomous agent actions before they become production incidents.**

AgentBlackbox is not an AI agent builder. It is the monitoring, audit, replay, and governance layer for autonomous AI systems.

---

## Track

**Track 2: Monetizable B2B App**

---

## Problem

AI agents are increasingly being used to make decisions, call tools, access customer data, process refunds, review claims, and automate internal workflows.

But when an autonomous agent fails, teams often cannot clearly answer:

- What did the agent see?
- What memory did it use?
- What tool did it call?
- What policy was checked?
- Was the action blocked or approved?
- Who made the final decision?
- Can the incident be replayed for audit or compliance?

AgentBlackbox solves this by turning every agent action into a structured, replayable event.

---

## Solution

AgentBlackbox provides a real-time command center and replay console for AI-agent activity.

It allows teams to:

- Monitor live agent activity
- Replay agent runs step by step
- Inspect tool calls and JSON payloads
- Review policy violations
- Track memory before/after changes
- Approve or deny high-risk actions
- Generate audit-ready incident records
- Understand how each UI screen maps to a DynamoDB access pattern

---

## Key Features

### Command Center

A live AI-agent monitoring dashboard showing:

- Active critical incidents
- Total agent runs
- High-risk runs
- Pending approvals
- Blocked actions
- Recent agent runs
- Live event feed
- Risk distribution
- Replay queue
- Database ledger health
- System health

### Run Replay

The flagship incident-forensics screen.

It reconstructs a complete agent run with:

- Vertical replay timeline
- Selected event inspector
- JSON action payload viewer
- Policy violation evidence
- Memory state diff
- Human approval status
- Replay controls
- Run summary metrics

Example incident:

> Refund Agent attempted an unauthorized $4,800 refund.

### Approval Queue

Human-in-the-loop review for risky agent actions.

Teams can approve or deny pending actions such as:

- Medical claim history access
- High-value refund processing
- Customer order lookups
- Sensitive data exports

### Integrations

A developer-facing page showing how existing agents can send structured events to AgentBlackbox.

Supported agent types include:

- LangChain agents
- CrewAI agents
- OpenAI workflows
- Custom backend agents
- n8n / Zapier-style automations
- Customer support bots
- Internal workflow agents

### Database Architecture

A visual architecture explorer showing how AgentBlackbox uses a DynamoDB event ledger to power replay, approvals, dashboards, and audit reports.

---

## DynamoDB Architecture

AgentBlackbox is designed around an Amazon DynamoDB single-table event ledger.

### Table

```txt
AgentBlackboxEvents
```

### Primary Key

```txt
PK = TENANT#<tenantId>
SK = RUN#<runId>#EVENT#<timestamp>#<eventId>
```

This allows the app to fetch all events for a specific agent run in chronological order.

### GSI1 — Agent Timeline

```txt
GSI1PK = TENANT#<tenantId>#AGENT#<agentId>
GSI1SK = TIMESTAMP#<timestamp>
```

Used to fetch events by agent.

### GSI2 — Risk Dashboard

```txt
GSI2PK = TENANT#<tenantId>#RISK#<riskLevel>
GSI2SK = TIMESTAMP#<timestamp>
```

Used to fetch high-risk and critical events.

### GSI3 — Approval Queue

```txt
GSI3PK = TENANT#<tenantId>#STATUS#<status>
GSI3SK = TIMESTAMP#<timestamp>
```

Used to fetch pending approval events.

---

## Access Patterns

| Screen | Access Pattern | DynamoDB Query Strategy |
|---|---|---|
| Run Replay | Fetch full run timeline | Table PK/SK query |
| Command Center | Fetch high-risk events | GSI2 |
| Approval Queue | Fetch pending approvals | GSI3 |
| Agent History | Fetch events by agent | GSI1 |
| Audit Report | Export run events | Table PK/SK query |
| Live Feed | Fetch recent event activity | Timestamp-ordered event stream |

---

## Simulation Engine

AgentBlackbox includes a demo simulation engine that streams realistic events from multiple simulated agents.

Simulated agents include:

- **RefundAgent** — attempts refunds and may violate refund policies
- **KYCVerifier** — checks identities and flags suspicious documents
- **ClaimsProcessor** — reviews insurance or medical claims
- **SalesDataAgent** — analyzes or exports sales data
- **HR Onboarding Agent** — reads employee records
- **FraudScreen** — detects suspicious transactions

The simulation can generate events such as:

```txt
RUN_STARTED
USER_REQUEST_RECEIVED
MEMORY_READ
CUSTOMER_PROFILE_READ
TOOL_CALLED
POLICY_CHECKED
ACTION_ATTEMPTED
POLICY_VIOLATION_DETECTED
ACTION_BLOCKED
HUMAN_APPROVAL_REQUESTED
HUMAN_APPROVED
HUMAN_DENIED
ACTION_CANCELLED
ACTION_EXECUTED
MEMORY_UPDATED
AUDIT_REPORT_GENERATED
RUN_COMPLETED
```

---

## Example Event

```json
{
  "tenantId": "demo",
  "agentId": "refund-agent",
  "agentName": "RefundAgent",
  "runId": "run_8f3a1a2b",
  "eventType": "ACTION_ATTEMPTED",
  "riskLevel": "CRITICAL",
  "status": "BLOCKED",
  "action": "ProcessRefund",
  "amount": 4800,
  "currency": "USD",
  "policyId": "refund.amount.limit",
  "timestamp": "2026-06-09T14:31:18.456Z",
  "payload": {
    "orderId": "A10293",
    "customerId": "user_9c7f2d",
    "reason": "Product not as described"
  }
}
```

---

## Tech Stack

- **Next.js App Router**
- **TypeScript**
- **Tailwind CSS**
- **Vercel**
- **Amazon DynamoDB**
- **AWS SDK**
- **Local mock data and simulation engine for demo mode**

---

## Planned API Routes

```txt
POST /api/events
GET  /api/runs
GET  /api/runs/[runId]
GET  /api/approvals
GET  /api/reports
POST /api/simulate
```

---

## Demo Flow

1. Open the landing page.
2. Launch the Command Center.
3. Start the live simulation engine.
4. Watch simulated agents stream events into the system.
5. Open a critical incident.
6. Replay the agent run step by step.
7. Inspect the JSON payload, policy violation, memory diff, and approval status.
8. Review the DynamoDB architecture page.
9. Show how the event ledger powers the replay and audit experience.

---

## Project Status

Current phase:

- Frontend prototype
- Mock-mode simulation
- Local event data
- UI pages and interactions

Next phase:

- Connect real Amazon DynamoDB table
- Add AWS SDK route handlers
- Seed demo events into DynamoDB
- Read replay timelines from DynamoDB
- Deploy final project on Vercel

---

## Hackathon Submission Focus

AgentBlackbox is designed to demonstrate:

- A deliberate DynamoDB data model
- Query-optimized event replay
- Human-in-the-loop governance
- AI-agent observability
- Production-style B2B architecture
- A polished incident-forensics user experience

---

## Repository

```txt
https://github.com/JemimahAO/AGENT-BLACK-BOX.git
```

---

## Author

Built by **Jemimah Adwar** for the H0 Hackathon.
