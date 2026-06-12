import React from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Database, ArrowRight, Monitor, Server, Cloud, BarChart3, Shield, Key, Zap, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const GSI_CARDS = [
  {
    name: 'GSI1 — Agent Timeline',
    pk: 'TENANT#<tenantId>#AGENT#<agentId>',
    sk: 'TIMESTAMP#<timestamp>',
    usedFor: 'Fetch events by agent',
    icon: '📊',
    color: 'border-secondary/30 bg-secondary/5',
    headerColor: 'text-secondary',
  },
  {
    name: 'GSI2 — Risk Dashboard',
    pk: 'TENANT#<tenantId>#RISK#<riskLevel>',
    sk: 'TIMESTAMP#<timestamp>',
    usedFor: 'Fetch high-risk events',
    icon: '🔴',
    color: 'border-destructive/30 bg-destructive/5',
    headerColor: 'text-destructive',
  },
  {
    name: 'GSI3 — Approval Queue',
    pk: 'TENANT#<tenantId>#STATUS#<status>',
    sk: 'TIMESTAMP#<timestamp>',
    usedFor: 'Fetch pending approvals',
    icon: '✅',
    color: 'border-primary/30 bg-primary/5',
    headerColor: 'text-primary',
  },
];

const ACCESS_PATTERNS = [
  { useCase: 'Run Replay', description: 'Fetch full run timeline', access: 'Table PK/SK query', gsi: 'Primary Table', pageRef: 'Run Replay' },
  { useCase: 'Command Center', description: 'Fetch critical events', access: 'Partition by risk level', gsi: 'GSI2', pageRef: 'Command Center' },
  { useCase: 'Approval Queue', description: 'Fetch pending approvals', access: 'Partition by status', gsi: 'GSI3', pageRef: 'Approvals' },
  { useCase: 'Agent History', description: 'Fetch events by agent', access: 'Partition by agentId', gsi: 'GSI1', pageRef: 'Run Replay' },
  { useCase: 'Audit Report', description: 'Export run events', access: 'Range query on SK', gsi: 'Primary Table', pageRef: 'Run Replay' },
  { useCase: 'Live Feed', description: 'Fetch recent events', access: 'Timestamp-ordered stream', gsi: 'GSI1/GSI2', pageRef: 'Command Center' },
];

const DESIGN_CARDS = [
  { icon: Shield, title: 'No full scans', description: 'Every access pattern is served by PK/SK or GSI queries — zero table scans at any scale.' },
  { icon: Zap, title: 'Query-optimized', description: 'Three GSIs provide instant access to events by agent, risk level, and approval status.' },
  { icon: Key, title: 'Multi-tenant', description: 'TENANT# prefix on all partition keys ensures strict data isolation between organizations.' },
  { icon: Lock, title: 'Immutable append-only', description: 'Events are written once and never updated. The event ledger is forensically reliable.' },
  { icon: BarChart3, title: 'Replay by sort key', description: 'RUN# + EVENT# + timestamp SK ordering enables sub-millisecond run replay queries.' },
  { icon: Shield, title: 'Sparse approval index', description: 'GSI3 only indexes PENDING/APPROVED/DENIED items, keeping the approval queue tight and fast.' },
];

const SAMPLE_RECORD = {
  PK: 'TENANT#demo',
  SK: 'RUN#run_8f3a1a2b#EVENT#2026-06-09T14:31:18.456Z#evt_9f7a',
  GSI1PK: 'TENANT#demo#AGENT#refund-agent',
  GSI1SK: 'TIMESTAMP#2026-06-09T14:31:18.456Z',
  GSI2PK: 'TENANT#demo#RISK#CRITICAL',
  GSI2SK: 'TIMESTAMP#2026-06-09T14:31:18.456Z',
  GSI3PK: 'TENANT#demo#STATUS#BLOCKED',
  GSI3SK: 'TIMESTAMP#2026-06-09T14:31:18.456Z',
  eventType: 'ACTION_ATTEMPTED',
  riskLevel: 'CRITICAL',
  status: 'BLOCKED',
  action: 'ProcessRefund',
  amount: 4800,
  currency: 'USD',
  agentId: 'refund-agent',
  agentName: 'RefundAgent',
  runId: 'run_8f3a1a2b',
};

const FLOW_NODES = [
  { icon: Monitor, label: 'Frontend', sublabel: 'on Vercel', color: 'bg-secondary/20 border-secondary/40 text-secondary' },
  { icon: Server, label: 'Next.js Route\nHandlers', sublabel: 'Route Handlers', color: 'bg-primary/20 border-primary/40 text-primary' },
  { icon: Cloud, label: 'AWS SDK', sublabel: 'DynamoDB Client', color: 'bg-status-high/20 border-status-high/40 text-status-high' },
  { icon: Database, label: 'Amazon\nDynamoDB', sublabel: 'AgentBlackboxEvents', color: 'bg-destructive/20 border-destructive/40 text-destructive' },
  { icon: BarChart3, label: 'Event Replay\nUI', sublabel: 'Run Replay', color: 'bg-status-low/20 border-status-low/40 text-status-low' },
];

export default function DatabaseArchitecturePage() {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5">

        {/* Architecture Flow — Premium explorer */}
        <div className="rounded-xl border border-border glass-card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-border/60"
            style={{ background: 'rgba(255,138,0,0.04)' }}>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-4 bg-primary rounded-full shrink-0" />
              <h3 className="text-sm font-bold text-foreground">System Architecture Flow</h3>
            </div>
            <p className="text-xs text-muted-foreground ml-4">
              How agent events flow from production systems into the DynamoDB event ledger and back to the UI.
            </p>
          </div>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-0">
              {FLOW_NODES.map((node, i) => {
                const isDynamo = node.label.includes('DynamoDB');
                return (
                  <React.Fragment key={node.label}>
                    <div className="flex flex-row md:flex-col items-center gap-3 md:gap-0 w-full md:w-auto md:flex-1">
                      <div className={cn(
                        'w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center shrink-0 md:mx-auto transition-all',
                        node.color,
                        isDynamo && 'glow-amber shadow-lg'
                      )}>
                        <node.icon className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                      <div className="text-left md:text-center mt-0 md:mt-3">
                        <div className={cn('text-xs font-bold whitespace-pre-line text-balance', isDynamo ? 'text-primary' : 'text-foreground')}>{node.label}</div>
                        <div className={cn('text-[10px]', isDynamo ? 'text-primary/70' : 'text-muted-foreground')}>{node.sublabel}</div>
                      </div>
                    </div>
                    {i < FLOW_NODES.length - 1 && (
                      <div className="flex items-center justify-center shrink-0 self-center md:px-1">
                        <ArrowRight className="w-4 h-4 text-primary/40 rotate-90 md:rotate-0" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Table Design + Sample Record */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Primary Table Design — amber glow */}
          <div className="rounded-xl border border-primary/25 overflow-hidden glass-card glow-amber">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="flex items-center gap-2 px-4 py-3.5 border-b border-primary/18"
              style={{ background: 'rgba(255,138,0,0.06)' }}>
              <div className="w-7 h-7 rounded-lg bg-primary/18 border border-primary/30 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Primary Table Design</h3>
                <code className="text-[10px] text-primary mono">AgentBlackboxEvents</code>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">Partition Key (PK)</div>
                  <div className="code-console rounded-lg px-2.5 py-2">
                    <code className="text-[10px] text-status-low mono break-all leading-relaxed">TENANT#&lt;tenantId&gt;</code>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Isolates all data per tenant</p>
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">Sort Key (SK)</div>
                  <div className="code-console rounded-lg px-2.5 py-2">
                    <code className="text-[10px] text-primary mono break-all leading-relaxed">RUN#&lt;runId&gt;#EVENT#&lt;ts&gt;#&lt;id&gt;</code>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">Ordered event replay</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border/40">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Key Properties</div>
                {['Single-table design — all event types in one table', 'Append-only writes — immutable forensic ledger', 'Sort key prefix ordering enables instant replay'].map((p) => (
                  <div key={p} className="flex items-start gap-2 text-xs text-muted-foreground mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sample DynamoDB Item — code console */}
          <div className="rounded-xl overflow-hidden border border-secondary/20">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-secondary/15 bg-secondary/5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-destructive/60" />
                  <span className="w-2 h-2 rounded-full bg-status-medium/60" />
                  <span className="w-2 h-2 rounded-full bg-status-low/60" />
                </div>
                <span className="text-[10px] text-secondary/80 mono font-bold ml-1">sample-item.json</span>
              </div>
              <span className="text-[9px] text-muted-foreground border border-border bg-muted/40 px-1.5 py-0.5 rounded mono">DynamoDB Item</span>
            </div>
            <div className="code-console p-4 max-h-72 overflow-y-auto">
              <div className="space-y-0.5">
                {Object.entries(SAMPLE_RECORD).map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-[10px] mono py-0.5 border-b border-border/15 last:border-0">
                    <span className={cn(
                      'shrink-0 w-[76px] font-bold',
                      k.startsWith('GSI1') ? 'text-secondary' :
                      k.startsWith('GSI2') ? 'text-destructive' :
                      k.startsWith('GSI3') ? 'text-primary' :
                      k === 'PK' || k === 'SK' ? 'text-status-low' :
                      'text-muted-foreground'
                    )}>
                      {k}
                    </span>
                    <span className="text-foreground/80 break-all min-w-0 leading-relaxed">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GSI Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {GSI_CARDS.map((gsi) => (
            <div key={gsi.name} className={cn('rounded-xl border p-5 h-full flex flex-col glass-card', gsi.color)}>
              <div className="flex items-center gap-2.5 mb-3.5">
                <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center text-base shrink-0', gsi.color)}>{gsi.icon}</div>
                <h4 className={cn('text-xs font-black', gsi.headerColor)}>{gsi.name}</h4>
              </div>
              <div className="space-y-2.5 flex-1">
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Partition Key</div>
                  <code className={cn('text-[10px] mono break-all leading-relaxed block', gsi.headerColor)}>{gsi.pk}</code>
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Sort Key</div>
                  <code className="text-[10px] mono text-muted-foreground">{gsi.sk}</code>
                </div>
                <div className="pt-2.5 border-t border-border/30 mt-auto">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Access Pattern</div>
                  <div className={cn('text-xs font-bold', gsi.headerColor)}>{gsi.usedFor}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Access Pattern Matrix */}
        <div className="rounded-xl border border-border glass-card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-border/60"
            style={{ background: 'rgba(255,138,0,0.04)' }}>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-4 bg-primary rounded-full shrink-0" />
              <h3 className="text-sm font-bold text-foreground">Access Pattern Matrix</h3>
            </div>
            <p className="text-xs text-muted-foreground ml-4">Every UI feature maps to a specific DynamoDB query — zero table scans.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border/50">
                  {['Use Case', 'Access Pattern', 'DynamoDB Query', 'GSI / Table', 'UI Page'].map((h) => (
                    <th key={h} className="text-left text-[9px] font-black uppercase tracking-widest text-muted-foreground px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACCESS_PATTERNS.map((p) => (
                  <tr key={p.useCase} className="border-b border-border/25 hover:bg-primary/4 transition-colors">
                    <td className="px-4 py-3 text-xs font-bold text-foreground whitespace-nowrap">{p.useCase}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{p.description}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground mono whitespace-nowrap">{p.access}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-block text-[9px] font-black mono px-2 py-0.5 rounded border tracking-wider',
                        p.gsi.includes('GSI1') ? 'text-secondary border-secondary/30 bg-secondary/10' :
                        p.gsi.includes('GSI2') ? 'text-destructive border-destructive/30 bg-destructive/10' :
                        p.gsi.includes('GSI3') ? 'text-primary border-primary/30 bg-primary/10' :
                        'text-muted-foreground border-border bg-muted'
                      )}>
                        {p.gsi}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">{p.pageRef}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Design Principle Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DESIGN_CARDS.map((c) => (
            <div key={c.title} className="p-4 rounded-xl border border-border glass-card h-full flex gap-3 hover:border-primary/25 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center shrink-0">
                <c.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground mb-1 text-balance">{c.title}</div>
                <p className="text-xs text-muted-foreground text-pretty leading-relaxed">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
