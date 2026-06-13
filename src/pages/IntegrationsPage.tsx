import React, { useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import {
  Copy, Check, Code2, Zap, Activity, FileJson,
  Send, CheckCircle, Zap as ZapIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAppStatus } from '@/contexts/AppStatusContext';

const JS_SNIPPET = `import { AgentBlackbox } from '@agentblackbox/sdk';

const blackbox = new AgentBlackbox({
  apiKey: process.env.BLACKBOX_API_KEY,
  endpoint: 'https://api.agentblackbox.io',
});

await blackbox.logEvent({
  tenantId: "acme",
  runId: "run_10482",
  agentId: "refund-agent",
  eventType: "TOOL_CALLED",
  action: "ProcessRefund",
  riskLevel: "HIGH",
  payload: {
    amount: 4800,
    currency: "USD",
    orderId: "A10293"
  }
});`;

const PYTHON_SNIPPET = `from agentblackbox import AgentBlackbox

blackbox = AgentBlackbox(
    api_key=os.environ["BLACKBOX_API_KEY"],
    endpoint="https://api.agentblackbox.io",
)

blackbox.log_event({
    "tenantId": "acme",
    "runId": "run_10482",
    "agentId": "refund-agent",
    "eventType": "TOOL_CALLED",
    "action": "ProcessRefund",
    "riskLevel": "HIGH",
    "payload": {
        "amount": 4800,
        "currency": "USD",
        "orderId": "A10293"
    }
})`;

const EVENT_SCHEMA = {
  tenantId: "string — your organization identifier",
  runId: "string — unique run session ID",
  agentId: "string — agent identifier",
  eventType: "EventType — see event types list",
  riskLevel: "INFO | LOW | MEDIUM | HIGH | CRITICAL",
  status: "OK | BLOCKED | FLAGGED | PENDING | COMPLETED",
  action: "string? — the action the agent attempted",
  amount: "number? — financial amount if applicable",
  payload: "object — any additional structured context",
};

const SUPPORTED_AGENTS = [
  { name: 'LangChain', tag: 'Python / JS', icon: '🦜' },
  { name: 'CrewAI', tag: 'Python', icon: '🤖' },
  { name: 'OpenAI Workflows', tag: 'JS / Python', icon: '🧠' },
  { name: 'Custom Backend Agents', tag: 'Any HTTP', icon: '⚙️' },
  { name: 'n8n / Zapier Automations', tag: 'Webhook', icon: '⚡' },
  { name: 'Customer Support Bots', tag: 'Any', icon: '🎧' },
  { name: 'Internal Workflow Agents', tag: 'Any', icon: '🔧' },
];

const API_KEY = 'sk-blackbox-demo-xxxx-xxxx-x7f3a2b1c4d5';

export default function IntegrationsPage() {
  const { recordSuccessfulWrite, status } = useAppStatus();
  const [activeTab, setActiveTab] = useState<'javascript' | 'python'>('javascript');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [lastEvent, setLastEvent] = useState<null | typeof EVENT_SCHEMA>(null);
  const [sending, setSending] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);

  const copyKey = () => {
    setCopiedKey(true);
    toast.success('API key copied');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyCode = () => {
    setCopiedCode(true);
    toast.success('Code snippet copied');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const sendTestEvent = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo',
          runId: 'run_integration_test_' + Date.now(),
          agentId: 'test-agent',
          eventType: 'TOOL_CALLED',
          action: 'ProcessRefund',
          riskLevel: 'HIGH',
          status: 'received',
          payload: {
            amount: 4800,
            currency: 'USD',
            orderId: 'A10293'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        recordSuccessfulWrite('run_integration_test_' + Date.now(), 1);
        setLastEvent(EVENT_SCHEMA);
        toast.success('Test event received', { description: 'Event ingested into ledger · Timestamp: ' + new Date().toLocaleTimeString() });
      }
    } catch (error) {
      toast.error('Failed to send test event', { description: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setSending(false);
    }
  };

  const runRefundDemo = async () => {
    setDemoRunning(true);
    try {
      const response = await fetch('/api/agents/refund-demo', { method: 'POST' });
      const data = await response.json();
      if (data.ok) {
        recordSuccessfulWrite(data.runId, 10);
        toast.success('Demo completed', { description: `${data.eventsCreated} events from RefundAgent v2.7.4` });
      }
    } catch (error) {
      toast.error('Demo failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setDemoRunning(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5">

        {/* Ingestion Status Bar */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-status-low/25 bg-status-low/6 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="live-dot" />
            <span className="text-xs font-bold text-status-low">Ingestion Active</span>
          </div>
          <div className="w-px h-4 bg-border hidden md:block" />
          <span className="text-xs text-muted-foreground">Event pipeline operational · 12,842 events/min</span>
          <div className="flex-1" />
          <span className="text-[10px] mono text-primary border border-primary/20 bg-primary/8 px-2 py-0.5 rounded">POST /api/events</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left: API Key + Endpoint + Test Event */}
          <div className="space-y-4">
            {/* API Endpoint Card */}
            <div className="rounded-xl border border-primary/20 glass-card overflow-hidden glow-amber">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/15"
                style={{ background: 'rgba(255,138,0,0.05)' }}>
                <div className="w-6 h-6 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">API Endpoint</h3>
              </div>
              <div className="p-4 space-y-3.5">
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Event Ingestion URL</div>
                  <div className="code-console rounded-lg px-3 py-2.5 flex items-center gap-2">
                    <span className="text-status-low font-bold text-xs mono">POST</span>
                    <code className="flex-1 min-w-0 text-xs text-primary mono truncate">
                      https://api.agentblackbox.io/api/events
                    </code>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-2">API Key</div>
                  <div className="flex items-center gap-2">
                    <div className="code-console rounded-lg px-3 py-2.5 flex-1 min-w-0">
                      <code className="text-xs text-muted-foreground mono truncate block">{API_KEY}</code>
                    </div>
                    <Button variant="ghost" size="sm" onClick={copyKey}
                      className="shrink-0 h-9 px-3 text-muted-foreground hover:text-primary border border-border hover:border-primary/30">
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-status-low" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={sendTestEvent} disabled={sending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/85 font-bold glow-amber">
                  {sending ? (
                    <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />Sending Test Event...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" />Send Test Event</>
                  )}
                </Button>
              </div>
            </div>

            {/* Last received event */}
            {lastEvent ? (
              <div className="rounded-xl border border-status-low/30 overflow-hidden glass-card glow-green">
                <div className="h-0.5 bg-gradient-to-r from-transparent via-status-low/50 to-transparent" />
                <div className="flex items-center justify-between px-4 py-3 border-b border-status-low/20 bg-status-low/5">
                  <div className="flex items-center gap-2">
                    <div className="live-dot" />
                    <CheckCircle className="w-3.5 h-3.5 text-status-low" />
                    <span className="text-xs font-bold text-foreground">Last Received Event</span>
                  </div>
                  <span className="text-[10px] text-status-low font-semibold">Just now</span>
                </div>
                <div className="p-4 code-console">
                  <div className="space-y-1.5">
                    {Object.entries({
                      eventType: 'TOOL_CALLED',
                      agentId: 'refund-agent',
                      riskLevel: 'HIGH',
                      status: 'received',
                      ledger: 'TENANT#demo',
                    }).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-2 text-[11px]">
                        <span className="text-primary mono">{k}</span>
                        <span className="text-status-low mono font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/20 p-6 text-center">
                <Activity className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <div className="text-xs font-semibold text-foreground mb-1">No events received yet</div>
                <div className="text-[10px] text-muted-foreground">Click "Send Test Event" above to verify your connection</div>
              </div>
            )}

            {/* Supported Agents */}
            <div className="rounded-xl border border-border glass-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
                <div className="w-1.5 h-4 bg-secondary rounded-full shrink-0" />
                <h3 className="text-sm font-bold text-foreground">Supported Agent Types</h3>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {SUPPORTED_AGENTS.map((agent) => (
                  <div key={agent.name} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/40 hover:border-primary/25 hover:bg-primary/5 transition-all">
                    <div className="w-7 h-7 rounded-md bg-muted/60 border border-border flex items-center justify-center text-sm shrink-0">{agent.icon}</div>
                    <div className="min-w-0">
                      <div className="text-xs text-foreground font-semibold truncate">{agent.name}</div>
                      <div className="text-[10px] text-muted-foreground">{agent.tag}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Agent Demo */}
            <div className="rounded-xl border border-status-low/25 glass-card overflow-hidden bg-status-low/4">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-status-low/20">
                <div className="live-dot" />
                <h3 className="text-sm font-bold text-foreground">Connected Agent Demo</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Test a fully connected agent. RefundAgent v2.7.4 will process a refund request and generate 10 events in the ledger, including a policy violation and approval flow.
                </div>
                <Button
                  onClick={runRefundDemo}
                  disabled={demoRunning}
                  className="w-full bg-status-low text-background hover:bg-status-low/85 font-bold"
                >
                  {demoRunning ? (
                    <><div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />Running Demo...</>
                  ) : (
                    <><ZapIcon className="w-4 h-4 mr-2" />Run RefundAgent Demo</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right: SDK Snippet + Schema */}
          <div className="space-y-4">
            {/* SDK Code Block — Developer product page */}
            <div className="rounded-xl overflow-hidden border border-secondary/20">
              {/* Console titlebar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-secondary/15 bg-secondary/5">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-destructive/60" />
                    <span className="w-2 h-2 rounded-full bg-status-medium/60" />
                    <span className="w-2 h-2 rounded-full bg-status-low/60" />
                  </div>
                  <Code2 className="w-3.5 h-3.5 text-secondary ml-1" />
                  <h3 className="text-xs font-bold text-foreground">SDK Snippet</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-muted/60 border border-border/50">
                    {(['javascript', 'python'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveTab(lang)}
                        className={cn(
                          'px-2.5 py-1 text-[10px] rounded transition-colors font-bold',
                          activeTab === lang
                            ? 'bg-secondary/20 text-secondary border border-secondary/30'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {lang === 'javascript' ? 'JS' : 'Python'}
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyCode}
                    className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary border border-transparent hover:border-primary/20">
                    {copiedCode ? <Check className="w-3 h-3 mr-1 text-status-low" /> : <Copy className="w-3 h-3 mr-1" />}
                    Copy
                  </Button>
                </div>
              </div>
              <div className="code-console p-4 overflow-auto max-h-80">
                <pre className="text-[11px] mono leading-relaxed">
                  {(activeTab === 'javascript' ? JS_SNIPPET : PYTHON_SNIPPET).split('\n').map((line, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-muted-foreground/40 w-5 shrink-0 text-right select-none">{i + 1}</span>
                      <code className="text-foreground">{line}</code>
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            {/* Event Schema */}
            <div className="rounded-xl border border-border glass-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60"
                style={{ background: 'rgba(255,138,0,0.04)' }}>
                <div className="w-6 h-6 rounded-md bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <FileJson className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Event Schema</h3>
              </div>
              <div className="p-4 space-y-2">
                {Object.entries(EVENT_SCHEMA).map(([key, desc]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 text-xs py-1.5 border-b border-border/20 last:border-0">
                    <code className="text-primary mono shrink-0 font-bold">{key}</code>
                    <span className="text-muted-foreground text-pretty">{desc}</span>
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
