import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { RiskBadge, StatusBadge } from '@/components/ui/Badges';
import { EventIcon } from '@/components/ui/EventIcon';
import { mockReplayEvents } from '@/lib/mock/events';
import type { TimelineEvent } from '@/lib/types';
import { useAppStatus } from '@/contexts/AppStatusContext';
import { useReports } from '@/contexts/ReportsContext';
import { useSession } from '@/contexts/SessionContext';
import {
  AlertTriangle,
  Play,
  FileText,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  XCircle,
  X,
  Download,
  Code2,
  Gauge,
  Activity,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const MEMORY_BEFORE: Record<string, string | number | boolean> = {
  'user.trust_score': 0.82,
  'agent.authority_level': 500,
  'session.refund_count': 1,
  'order.status': 'delivered',
  'order.total_amount': 2150,
};

const MEMORY_AFTER: Record<string, string | number | boolean> = {
  'user.trust_score': 0.82,
  'agent.authority_level': 500,
  'session.refund_count': 1,
  'order.total_amount': 2150,
  'order.status': 'delivered',
  'order.refund_attempted': 4800,
  'risk.score': 98,
  'audit.flagged': true,
  'escalation.required': true,
};

const CHANGED_KEYS = ['order.refund_attempted', 'risk.score', 'audit.flagged', 'escalation.required'];

function formatEventTime(ts: string | number): string {
  try {
    const date = new Date(typeof ts === 'string' ? ts : ts);
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '--:--:--';
  }
}

function JsonViewer({ data, className }: { data: unknown; className?: string }) {
  const lines = JSON.stringify(data, null, 2).split('\n');
  return (
    <pre className={cn('text-[11px] mono leading-relaxed whitespace-pre-wrap break-words overflow-auto', className)}>
      {lines.map((line, i) => {
        const rendered = line
          .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span class="text-primary">$1</span>:')
          .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="text-status-low">$1</span>')
          .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-secondary">$1</span>')
          .replace(/:\s*(true|false|null)/g, ': <span class="text-status-medium">$1</span>');
        return (
          <span
            key={i}
            className="block leading-6"
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        );
      })}
    </pre>
  );
}

// Helper functions for field extraction with fallback logic
function getFieldValue(event: any, field: string): string {
  switch (field) {
    case 'action':
      return (
        event.action ||
        event.payload?.action ||
        event.payload?.parameters?.action ||
        (event.eventType === 'ACTION_ATTEMPTED' ? 'ProcessRefund' : '—')
      );
    case 'target':
      return (
        event.target ||
        event.payload?.orderId ||
        event.payload?.parameters?.orderId ||
        'Order #A10293'
      );
    case 'amount':
      return (
        event.amount ||
        event.payload?.amount ||
        event.payload?.parameters?.amount ||
        '$4,800'
      );
    case 'currency':
      return event.currency || event.payload?.currency || 'USD';
    case 'policyId':
      return event.policyId || event.payload?.policyId || 'refund.amount.limit';
    case 'duration':
      if (event.eventType === 'ACTION_ATTEMPTED') return '1248ms';
      if (event.eventType === 'POLICY_CHECKED') return '82ms';
      return event.duration || '0ms';
    case 'eventId':
      return event.eventId || event.id || `evt_${Math.random().toString(36).substr(2, 9)}`;
    default:
      return '—';
  }
}

function RiskScoreCircle({ score = 98 }: { score?: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="absolute inset-0 transform -rotate-90" width="96" height="96">
          <circle
            cx="48"
            cy="48"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-destructive/20"
          />
          <circle
            cx="48"
            cy="48"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-destructive transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-black text-destructive">{score}</div>
            <div className="text-[10px] text-muted-foreground font-bold">RISK</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RunReplayPage() {
  const [searchParams] = useSearchParams();
  const { status, setLatestRunId, recordSuccessfulWrite } = useAppStatus();
  const { addReport } = useReports();
  const { mode } = useSession();

  const runIdParam = searchParams.get('runId') || 'run_8f3a1a2b';
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIdx, setReplayIdx] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [events, setEvents] = useState(mockReplayEvents);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [auditGenerated, setAuditGenerated] = useState(false);
  const [liveEmptyState, setLiveEmptyState] = useState(false);
  const [seedingData, setSeedingData] = useState(false);
  const replayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch live events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      setLiveEmptyState(false);
      try {
        const response = await fetch(`/api/events?runId=${runIdParam}`);
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.events && data.events.length > 0) {
            const transformedEvents = data.events.map((evt: any) => ({
              ...evt,
              label: evt.eventType?.replace(/_/g, ' ') || evt.label,
              description: evt.detail || evt.message || '',
              duration: 0,
            }));
            setEvents(transformedEvents);
            setIsLiveMode(true);
            setLiveEmptyState(false);
            setLatestRunId(runIdParam);
            recordSuccessfulWrite(runIdParam, transformedEvents.length);
          } else if (status.isDynamoConnected && status.dataMode === 'live') {
            // Live mode is connected, but no events for this run
            setIsLiveMode(true);
            setLiveEmptyState(true);
            setEvents([]);
          } else {
            // Fall back to mock mode if live mode failed or not connected
            setIsLiveMode(false);
            setLiveEmptyState(false);
          }
        } else {
          // API error - fallback to mock
          setIsLiveMode(false);
          setLiveEmptyState(false);
        }
      } catch (error) {
        setIsLiveMode(false);
        setLiveEmptyState(false);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [runIdParam, setLatestRunId, recordSuccessfulWrite, status.isDynamoConnected, status.dataMode]);

  const selectedEvent = events[selectedIdx];
  const eventDuration = selectedEvent?.duration ? `${selectedEvent.duration}ms` : (selectedEvent ? getFieldValue(selectedEvent, 'duration') : '0ms');

  const handleSeedDemoIncident = async () => {
    setSeedingData(true);
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
      if (data.ok) {
        recordSuccessfulWrite(data.runId, data.seeded);
        // Refetch events for the default run
        const eventsResponse = await fetch(`/api/events?runId=run_8f3a1a2b`);
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          if (eventsData.ok && eventsData.events && eventsData.events.length > 0) {
            const transformedEvents = eventsData.events.map((evt: any) => ({
              ...evt,
              label: evt.eventType?.replace(/_/g, ' ') || evt.label,
              description: evt.detail || evt.message || '',
              duration: 0,
            }));
            setEvents(transformedEvents);
            setLiveEmptyState(false);
            setIsLiveMode(true);
          }
        }
        toast.success('Demo incident seeded', { description: `${data.seeded} events written to DynamoDB` });
      }
    } catch (error) {
      toast.error('Failed to seed demo data');
    } finally {
      setSeedingData(false);
    }
  };

  const handleRunConnectedDemo = async () => {
    setSeedingData(true);
    try {
      const response = await fetch('/api/agents/refund-demo', { method: 'POST' });
      const data = await response.json();
      if (data.ok) {
        recordSuccessfulWrite(data.runId, data.eventsCreated);
        // Navigate to the new run
        window.location.href = `/run-replay?runId=${data.runId}`;
        toast.success('Connected agent demo completed', { description: `${data.eventsCreated} events created` });
      }
    } catch (error) {
      toast.error('Failed to run connected agent demo');
    } finally {
      setSeedingData(false);
    }
  };

  const handleReplayRun = () => {
    if (isReplaying) {
      if (replayRef.current) clearInterval(replayRef.current);
      setIsReplaying(false);
      setReplayIdx(-1);
      return;
    }

    setIsReplaying(true);
    setReplayIdx(0);
    let currentIdx = 0;

    replayRef.current = setInterval(() => {
      if (currentIdx < events.length - 1) {
        currentIdx++;
        setReplayIdx(currentIdx);
        setSelectedIdx(currentIdx);
      } else {
        if (replayRef.current) clearInterval(replayRef.current);
        setIsReplaying(false);
        setReplayIdx(-1);
      }
    }, 850);
  };

  const handleGenerateAudit = () => {
    const newReport = {
      reportId: 'report_' + Date.now().toString(36),
      runId: runIdParam,
      agentName: 'RefundAgent',
      riskLevel: 'CRITICAL' as const,
      eventCount: events.length,
      policyViolations: 1,
      blockedActions: 1,
      humanDecisions: 1,
      generatedAt: new Date().toISOString(),
      dataMode: (mode || 'mock') as 'live' | 'mock',
      summary: 'Refund request exceeded policy threshold and was escalated for human approval.',
      events: events,
    };

    addReport(newReport);
    setAuditGenerated(true);
    toast.success('Audit report generated', { description: 'Report ID: ' + newReport.reportId });

    // Write event to API if in live mode
    if (isLiveMode) {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'AUDIT_REPORT_GENERATED',
          runId: runIdParam,
          reportId: newReport.reportId,
          timestamp: Date.now(),
        }),
      }).catch(err => console.log('[v0] Could not write audit event:', err));
    }
  };

  const handleCopyJson = () => {
    const payload = selectedEvent?.payload || selectedEvent;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const isDataLive = isLiveMode && status.isDynamoConnected;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Cinematic Incident Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-destructive/30 bg-gradient-to-r from-destructive/15 via-destructive/8 to-transparent">
          {/* Glow effect */}
          <div className="absolute -inset-px bg-gradient-to-r from-destructive/20 to-transparent blur-2xl pointer-events-none" />

          <div className="relative p-6 flex items-start justify-between gap-6">
            {/* Left side: Critical incident info */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-destructive/20 border border-destructive/40">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <span className="text-xs font-bold text-destructive">CRITICAL INCIDENT</span>
                </div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/15 border border-primary/30">
                  <span className="text-xs font-mono text-primary">{runIdParam}</span>
                </div>
                <div className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold',
                  isDataLive
                    ? 'bg-status-low/12 border-status-low/30 text-status-low'
                    : 'bg-primary/12 border-primary/30 text-primary'
                )}>
                  <div className={cn('w-2 h-2 rounded-full', isDataLive ? 'bg-status-low rec-blink' : 'bg-primary')} />
                  {isDataLive ? 'Live DynamoDB Ledger' : 'Mock Mode'}
                </div>
              </div>

              <h1 className="text-2xl font-black text-foreground leading-tight">
                Refund Agent Attempted an Unauthorized ${getFieldValue(selectedEvent, 'amount')} Refund
              </h1>

              <div className="flex items-center gap-6 text-sm text-muted-foreground pt-1">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>RefundAgent v2.7.4</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Customer: Jemimah Adwar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatEventTime(selectedEvent?.timestamp || Date.now())}</span>
                </div>
              </div>
            </div>

            {/* Right side: Risk score + buttons */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <RiskScoreCircle score={98} />

              <div className="space-y-2 w-full">
                <Button
                  onClick={handleReplayRun}
                  size="sm"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/85 font-bold"
                >
                  {isReplaying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      {replayIdx >= 0 ? `Event ${replayIdx + 1} of ${events.length}` : 'Replaying...'}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Replay Run
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleGenerateAudit}
                  disabled={auditGenerated}
                  size="sm"
                  className={cn(
                    'w-full font-bold',
                    auditGenerated
                      ? 'bg-status-low/15 border border-status-low/35 text-status-low hover:bg-status-low/25'
                      : 'bg-foreground/8 border border-foreground/15 text-foreground hover:bg-foreground/12'
                  )}
                >
                  {auditGenerated ? <Check className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                  {auditGenerated ? 'Report Generated' : 'Generate Audit Report'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty Live State */}
        {liveEmptyState && events.length === 0 && (
          <div className="rounded-xl border border-status-low/25 bg-status-low/4 p-8 text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">No live events found</h3>
              <p className="text-sm text-muted-foreground">
                DynamoDB is connected, but this run has no recorded events yet. Seed the demo incident or run the connected agent demo to populate the ledger.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={handleSeedDemoIncident}
                disabled={seedingData}
                className="bg-status-low text-background hover:bg-status-low/85 font-bold"
              >
                {seedingData ? (
                  <>
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Seed Demo Incident
                  </>
                )}
              </Button>
              <Button
                onClick={handleRunConnectedDemo}
                disabled={seedingData}
                className="bg-primary text-primary-foreground hover:bg-primary/85 font-bold"
              >
                {seedingData ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Connected Agent Demo
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 3-Column Forensic Layout */}
        <div className="grid grid-cols-3 gap-4 min-h-[600px]">
          {/* Left: Event Timeline */}
          <div className="rounded-xl border border-primary/25 glass-card overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/15">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Event Timeline</h3>
              <span className="ml-auto text-xs text-muted-foreground">{events.length} events</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 p-3">
              {events.map((event, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isReplaying) setSelectedIdx(idx);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg border-l-4 transition-all text-xs',
                    selectedIdx === idx
                      ? 'bg-primary/20 border-l-primary text-foreground font-semibold'
                      : 'border-l-transparent hover:bg-primary/8 text-muted-foreground',
                    replayIdx === idx && 'ring-2 ring-status-low'
                  )}
                >
                  <div className="font-mono text-[10px] text-primary">{event.eventType}</div>
                  <div className="truncate">{event.label || event.eventType}</div>
                  <div className="text-[10px] text-muted-foreground">{formatEventTime(event.timestamp || 0)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Inspector + Memory State */}
          <div className="space-y-4 flex flex-col">
            {/* Event Detail Inspector */}
            <div className="rounded-xl border border-primary/25 glass-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/15">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Event Inspector</h3>
              </div>

              <div className="p-4 space-y-3 text-sm">
                {selectedEvent && (
                  <>
                    <div className="flex justify-between text-xs py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Action</span>
                      <span className="text-foreground font-semibold">{getFieldValue(selectedEvent, 'action')}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Target</span>
                      <span className="text-foreground font-semibold mono text-right">{getFieldValue(selectedEvent, 'target')}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-foreground font-semibold">{getFieldValue(selectedEvent, 'amount')} {getFieldValue(selectedEvent, 'currency')}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Policy</span>
                      <span className="text-foreground font-semibold mono text-right text-[10px]">{getFieldValue(selectedEvent, 'policyId')}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="text-foreground font-semibold">{eventDuration}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1.5">
                      <span className="text-muted-foreground">Event ID</span>
                      <span className="text-foreground font-semibold mono text-right text-[10px]">{getFieldValue(selectedEvent, 'eventId').substring(0, 12)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Memory State Diff */}
            <div className="rounded-xl border border-primary/25 glass-card overflow-hidden flex-1 flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-primary/15">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Memory State Diff</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
                {CHANGED_KEYS.map((key) => (
                  <div key={key} className="font-mono">
                    <div className="text-destructive">{key}</div>
                    <div className="text-muted-foreground ml-4">
                      {String(MEMORY_BEFORE[key])} → <span className="text-status-low">{String(MEMORY_AFTER[key])}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: JSON Payload + Evidence */}
          <div className="space-y-4 flex flex-col">
            {/* JSON Payload */}
            <div className="rounded-xl border border-primary/25 glass-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-primary/15">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">JSON Payload</h3>
                </div>
                <button
                  onClick={handleCopyJson}
                  className={cn(
                    'p-1 rounded-md transition-colors',
                    copied ? 'text-status-low bg-status-low/12' : 'text-muted-foreground hover:bg-primary/10'
                  )}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="overflow-auto max-h-64 p-3 bg-black/20">
                {selectedEvent && <JsonViewer data={selectedEvent.payload || selectedEvent} />}
              </div>
            </div>

            {/* Policy Violation Evidence */}
            <div className="rounded-xl border border-destructive/25 glass-card overflow-hidden flex-1 flex flex-col">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-destructive/20 bg-destructive/8">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-bold text-foreground">Policy Violation</h3>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground mb-2">Refund Threshold Exceeded</p>
                  <p>Amount ($4,800 USD) exceeds policy threshold ($500 USD) and requires human approval per RefundPolicy v2.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
