import React, { useState, useEffect } from 'react';
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
import { useAppStatus } from '@/contexts/AppStatusContext';

const ENV_VARS = [
  { key: 'AWS_ACCESS_KEY_ID', description: 'AWS IAM access key for DynamoDB SDK' },
  { key: 'AWS_SECRET_ACCESS_KEY', description: 'AWS IAM secret key' },
  { key: 'AWS_REGION', value: 'us-east-1', description: 'DynamoDB table region' },
  { key: 'DYNAMODB_TABLE_NAME', value: 'AgentBlackboxEvents', description: 'Primary event ledger table' },
  { key: 'BLACKBOX_TENANT_ID', value: 'demo', description: 'Default tenant identifier' },
];

export default function SettingsPage() {
  const { status, updateConnectionStatus, recordSuccessfulWrite, setPendingApprovalsCount } = useAppStatus();
  const [seeded, setSeeded] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  const handleTestConnection = async () => {
    setHealthLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (data.ok) {
        updateConnectionStatus(true, 'live');
        toast.success('Live Ledger Active', { description: `Connected to ${data.table} in ${data.region}` });
      } else {
        updateConnectionStatus(false, 'mock');
        toast.info('Mock Fallback Active', { description: 'Local demo data will be used' });
      }
    } catch (error) {
      updateConnectionStatus(false, 'mock');
      toast.error('Connection failed', { description: 'Using mock fallback mode' });
    } finally {
      setHealthLoading(false);
    }
  };

  const handleSeedDynamoDB = async () => {
    setSeedLoading(true);
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
      
      if (data.ok) {
        recordSuccessfulWrite(data.runId, data.seeded);
        updateConnectionStatus(true, 'live');
        setSeeded(true);
        toast.success('Demo data seeded', { 
          description: `${data.seeded} events written to DynamoDB for ${data.runId}` 
        });
        setTimeout(() => setSeeded(false), 3000);
      } else {
        toast.info('Seed request sent', { description: data.message });
      }
    } catch (error) {
      toast.error('Seed failed', { description: error instanceof Error ? error.message : String(error) });
    } finally {
      setSeedLoading(false);
    }
  };

  const handleSeed = () => {
    setSeeded(true);
    toast.success('Demo data seeded', { description: '24 runs and 1,200 events loaded into local ledger.' });
  };

  const handleClear = () => {
    setCleared(true);
    toast.info('Demo data cleared', { description: 'Local ledger reset to empty state.' });
    setTimeout(() => setCleared(false), 3000);
  };

  const isLive = status.isDynamoConnected && status.dataMode === 'live';
  const statusTitle = isLive ? 'Live Ledger Active' : 'Mock Fallback Active';
  const statusBadge = isLive ? 'LIVE' : 'MOCK';

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5">

        {/* Mode Status Banner */}
        <div className={cn(
          "relative rounded-xl border overflow-hidden glow-amber",
          isLive ? 'border-status-low/35' : 'border-primary/35'
        )}>
          <div className={cn(
            "h-0.5 bg-gradient-to-r from-transparent to-transparent",
            isLive ? 'via-status-low/60' : 'via-primary/60'
          )} />
          <div className={cn(
            "absolute inset-0 pointer-events-none",
            isLive ? 'bg-gradient-to-r from-status-low/8 to-transparent' : 'bg-gradient-to-r from-primary/8 to-transparent'
          )} />
          <div className="relative flex flex-wrap items-center gap-3 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className={cn(
                "w-6 h-6 rounded-md border flex items-center justify-center",
                isLive ? 'bg-status-low/18 border-status-low/35' : 'bg-primary/18 border-primary/35'
              )}>
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full rec-blink",
                  isLive ? 'bg-status-low' : 'bg-primary'
                )} />
              </div>
              <span className={cn(
                "text-xs font-black tracking-wider",
                isLive ? 'text-status-low' : 'text-primary'
              )}>
                {statusTitle}
              </span>
            </div>
            <div className="w-px h-4 bg-primary/25 hidden md:block" />
            <span className="text-xs text-muted-foreground flex-1 min-w-0 text-pretty">
              {isLive 
                ? 'AgentBlackbox is connected to Amazon DynamoDB and can record live agent events.'
                : 'Local demo data is being used because the live event ledger is unavailable.'
              }
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
                <div className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  isLive 
                    ? 'bg-status-low/6 border-status-low/25' 
                    : 'bg-status-medium/6 border-status-medium/25'
                )}>
                  <div>
                    <div className="text-xs font-bold text-foreground">Connection Status</div>
                    <div className="text-[10px] text-muted-foreground">
                      {isLive ? 'Connected to AWS DynamoDB' : 'Mock mode — not connected to AWS'}
                    </div>
                  </div>
                  <span className={cn(
                    "text-[9px] font-black border px-2 py-0.5 rounded tracking-widest",
                    isLive 
                      ? 'border-status-low/35 bg-status-low/10 text-status-low'
                      : 'border-primary/35 bg-primary/10 text-primary'
                  )}>
                    {statusBadge}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {[
                    { label: 'Table Name', value: 'AgentBlackboxEvents' },
                    { label: 'AWS Region', value: 'us-east-1' },
                    { label: 'Partition Key', value: 'PK (TENANT#id)' },
                    { label: 'Sort Key', value: 'SK (RUN#id#EVENT#ts)' },
                    { label: 'Billing Mode', value: 'PAY_PER_REQUEST' },
                    { label: 'Last Connection Check', value: status.lastSuccessfulConnectionCheck?.toLocaleTimeString() || 'Never' },
                    { label: 'Last Write', value: status.lastSuccessfulWrite?.toLocaleTimeString() || 'Never' },
                    { label: 'Seeded Run ID', value: status.lastSeededRunId || 'None' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2 text-xs py-1.5 border-b border-border/20 last:border-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-foreground font-semibold mono text-right text-[11px]">{value}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleTestConnection}
                  disabled={healthLoading}
                  className="w-full mt-3 bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 font-bold"
                >
                  {healthLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  {healthLoading ? 'Testing...' : 'Test DynamoDB Connection'}
                </Button>
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
                  Seed or reset the demo data used in Command Center, Run Replay, and Approvals.
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={handleSeedDynamoDB}
                    disabled={seedLoading}
                    className={cn(
                      'w-full font-bold',
                      seedLoading
                        ? 'bg-primary/50 text-primary-foreground'
                        : 'bg-primary text-primary-foreground hover:bg-primary/85 glow-amber'
                    )}
                  >
                    {seedLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    {seedLoading ? 'Seeding DynamoDB...' : 'Seed DynamoDB Demo Data'}
                  </Button>
                  <Button
                    onClick={handleSeed}
                    disabled={seeded}
                    className={cn(
                      'w-full font-bold',
                      seeded
                        ? 'bg-status-low/15 border border-status-low/35 text-status-low hover:bg-status-low/25'
                        : 'bg-primary/10 border border-primary/25 text-primary hover:bg-primary/15'
                    )}
                  >
                    {seeded ? <Check className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    {seeded ? 'Local Demo Data Seeded' : 'Seed Local Demo Data'}
                  </Button>
                </div>
                <Button
                  onClick={handleClear}
                  variant="ghost"
                  className="w-full border border-destructive/35 text-destructive hover:bg-destructive/10 font-bold"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Local Demo Data
                </Button>
                <div className="text-[10px] text-muted-foreground/70 leading-relaxed">
                  "Seed DynamoDB" writes real events to AWS. "Seed Local" uses mock data only.
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
                <h3 className="text-xs font-bold text-foreground">.env</h3>
                <span className="ml-auto text-[9px] border border-border bg-muted/40 px-1.5 py-0.5 rounded mono text-muted-foreground">Configuration</span>
              </div>
              <div className="code-console p-4 space-y-2.5">
                {ENV_VARS.map((env) => (
                  <div key={env.key} className="flex items-start gap-3">
                    {env.value ? (
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
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{env.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Status */}
            <div className="rounded-xl border border-border glass-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3.5 border-b border-border/60"
                style={{ background: 'rgba(255,138,0,0.04)' }}>
                <div className="w-7 h-7 rounded-lg bg-muted/60 border border-border flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">API Routes</h3>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { path: '/api/health', method: 'GET', status: isLive ? 'LIVE' : 'MOCK', desc: 'Check DynamoDB connection' },
                  { path: '/api/events', method: 'GET/POST', status: isLive ? 'LIVE' : 'MOCK', desc: 'Read/write agent events' },
                  { path: '/api/seed', method: 'POST', status: isLive ? 'LIVE' : 'MOCK', desc: 'Seed demo events' },
                  { path: '/api/agents/refund-demo', method: 'POST', status: isLive ? 'LIVE' : 'MOCK', desc: 'Connected agent demo' },
                ].map((route) => (
                  <div key={route.path} className="flex items-start gap-3 py-1.5 border-b border-border/20 last:border-0">
                    <Activity className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          'text-[9px] font-black px-1.5 py-0.5 rounded border tracking-wider',
                          route.method === 'GET' ? 'bg-status-low/12 text-status-low border-status-low/25' :
                          'bg-primary/12 text-primary border-primary/25'
                        )}>
                          {route.method}
                        </span>
                        <code className="text-xs text-foreground mono">{route.path}</code>
                        <span className={cn(
                          'text-[9px] font-bold border px-1.5 py-0.5 rounded tracking-wider',
                          route.status === 'LIVE'
                            ? 'border-status-low/25 bg-status-low/8 text-status-low'
                            : 'border-primary/25 bg-primary/8 text-primary'
                        )}>
                          {route.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{route.desc}</div>
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
