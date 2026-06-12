import React, { useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Database,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Server,
  Globe,
  Code2,
  Activity,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ENV_VARS = [
  { key: 'AWS_ACCESS_KEY_ID', status: 'MOCK', description: 'AWS IAM access key for DynamoDB SDK' },
  { key: 'AWS_SECRET_ACCESS_KEY', status: 'MOCK', description: 'AWS IAM secret key' },
  { key: 'AWS_REGION', status: 'SET', value: 'us-east-1', description: 'DynamoDB table region' },
  { key: 'DYNAMODB_TABLE_NAME', status: 'SET', value: 'AgentBlackboxEvents', description: 'Primary event ledger table' },
  { key: 'BLACKBOX_TENANT_ID', status: 'SET', value: 'demo', description: 'Default tenant identifier' },
  { key: 'BLACKBOX_API_KEY', status: 'MOCK', description: 'Ingestion API authentication key' },
];

const API_ROUTES = [
  { path: '/api/events', method: 'POST', description: 'Ingest new agent event', status: 'MOCK' },
  { path: '/api/runs', method: 'GET', description: 'List agent runs with filters', status: 'MOCK' },
  { path: '/api/runs/[runId]', method: 'GET', description: 'Fetch full run timeline', status: 'MOCK' },
  { path: '/api/approvals', method: 'GET', description: 'Fetch approval queue', status: 'MOCK' },
  { path: '/api/approvals/[id]', method: 'PATCH', description: 'Approve or deny request', status: 'MOCK' },
  { path: '/api/reports', method: 'POST', description: 'Generate audit report', status: 'MOCK' },
  { path: '/api/simulate', method: 'POST', description: 'Trigger simulation event', status: 'MOCK' },
];

export default function SettingsPage() {
  const [seeded, setSeeded] = useState(false);
  const [cleared, setCleared] = useState(false);

  const handleSeed = () => {
    setSeeded(true);
    toast.success('Demo data seeded', { description: '24 runs and 1,200 events loaded into local ledger.' });
  };

  const handleClear = () => {
    setCleared(true);
    toast.info('Demo data cleared', { description: 'Local ledger reset to empty state.' });
    setTimeout(() => setCleared(false), 3000);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5">

        {/* Mock Mode Banner — Polished deployment console */}
        <div className="relative rounded-xl border border-primary/35 overflow-hidden glow-amber">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/8 to-transparent pointer-events-none" />
          <div className="relative flex flex-wrap items-center gap-3 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-primary/18 border border-primary/35 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary rec-blink" />
              </div>
              <span className="text-xs font-black text-primary tracking-wider">MOCK MODE ACTIVE</span>
            </div>
            <div className="w-px h-4 bg-primary/25 hidden md:block" />
            <span className="text-xs text-muted-foreground flex-1 min-w-0 text-pretty">
              AgentBlackbox is running on local mock data. Configure real AWS credentials to enable live DynamoDB ingestion.
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Left: DynamoDB Connection + Data Management */}
          <div className="space-y-4">
            {/* DynamoDB Connection */}
            <div className="rounded-xl border border-primary/20 glass-card overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-primary/15"
                style={{ background: 'rgba(255,138,0,0.05)' }}>
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/28 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">DynamoDB Connection</h3>
              </div>
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between p-3 rounded-lg border border-status-medium/25 bg-status-medium/6">
                  <div>
                    <div className="text-xs font-bold text-foreground">Connection Status</div>
                    <div className="text-[10px] text-muted-foreground">Mock mode — not connected to AWS</div>
                  </div>
                  <span className="text-[9px] font-black text-primary border border-primary/35 bg-primary/10 px-2 py-0.5 rounded tracking-widest">
                    MOCK
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {[
                    { label: 'Table Name', value: 'AgentBlackboxEvents' },
                    { label: 'AWS Region', value: 'us-east-1' },
                    { label: 'GSI Count', value: '3 (Agent, Risk, Approval)' },
                    { label: 'Billing Mode', value: 'PAY_PER_REQUEST' },
                    { label: 'Last Write', value: 'Mock data only' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2 text-xs py-1.5 border-b border-border/20 last:border-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-semibold mono text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="rounded-xl border border-border glass-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border/60">
                <div className="w-7 h-7 rounded-lg bg-muted/60 border border-border flex items-center justify-center shrink-0">
                  <Server className="w-4 h-4 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Data Management</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Seed or reset the local demo data used in Command Center, Run Replay, and Approvals.
                </div>
                <Button
                  onClick={handleSeed}
                  disabled={seeded}
                  className={cn(
                    'w-full font-bold',
                    seeded
                      ? 'bg-status-low/15 border border-status-low/35 text-status-low hover:bg-status-low/25'
                      : 'bg-primary text-primary-foreground hover:bg-primary/85 glow-amber'
                  )}
                >
                  {seeded ? <Check className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {seeded ? 'Demo Data Seeded' : 'Seed Demo Data'}
                </Button>
                <Button
                  onClick={handleClear}
                  variant="ghost"
                  className="w-full border border-destructive/35 text-destructive hover:bg-destructive/10 font-bold"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Local Demo Data
                </Button>
                <div className="text-[10px] text-muted-foreground/70 leading-relaxed">
                  Clearing data only resets local mock state. No AWS changes will be made.
                </div>
              </div>
            </div>
          </div>

          {/* Right: Env Vars + API Routes — Deployment console */}
          <div className="space-y-4">
            {/* Environment Variables */}
            <div className="rounded-xl overflow-hidden border border-secondary/20">
              <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-secondary/15 bg-secondary/5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-destructive/60" />
                  <span className="w-2 h-2 rounded-full bg-status-medium/60" />
                  <span className="w-2 h-2 rounded-full bg-status-low/60" />
                </div>
                <Code2 className="w-3.5 h-3.5 text-secondary ml-1" />
                <h3 className="text-xs font-bold text-foreground">.env.local</h3>
                <span className="ml-auto text-[9px] border border-border bg-muted/40 px-1.5 py-0.5 rounded mono text-muted-foreground">Environment Variables</span>
              </div>
              <div className="code-console p-4 space-y-2.5">
                {ENV_VARS.map((env) => (
                  <div key={env.key} className="flex items-start gap-3">
                    {env.status === 'SET' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-status-low shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-status-medium shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs text-primary mono font-bold">{env.key}</code>
                        {env.value && (
                          <code className="text-[10px] text-status-low mono">
                            = "{env.value}"
                          </code>
                        )}
                        {env.status === 'MOCK' && (
                          <span className="text-[9px] font-bold text-primary border border-primary/30 bg-primary/10 px-1.5 py-0.5 rounded tracking-wider">
                            MOCK
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{env.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Route Checklist */}
            <div className="rounded-xl border border-border glass-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border/60"
                style={{ background: 'rgba(255,138,0,0.04)' }}>
                <div className="w-7 h-7 rounded-lg bg-muted/60 border border-border flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">API Route Checklist</h3>
              </div>
              <div className="p-4 space-y-2">
                {API_ROUTES.map((route) => (
                  <div key={route.path} className="flex items-start gap-3 py-1.5 border-b border-border/20 last:border-0">
                    <Activity className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          'text-[9px] font-black px-1.5 py-0.5 rounded border tracking-wider',
                          route.method === 'GET' ? 'bg-status-low/12 text-status-low border-status-low/25' :
                          route.method === 'POST' ? 'bg-primary/12 text-primary border-primary/25' :
                          'bg-status-medium/12 text-status-medium border-status-medium/25'
                        )}>
                          {route.method}
                        </span>
                        <code className="text-xs text-foreground mono">{route.path}</code>
                        <span className="text-[9px] font-bold text-primary border border-primary/25 bg-primary/8 px-1.5 py-0.5 rounded tracking-wider">
                          MOCK
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{route.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
