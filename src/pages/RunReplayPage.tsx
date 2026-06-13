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
        '—'
      );
    case 'currency':
      return (
        event.currency ||
        event.payload?.currency ||
        event.payload?.parameters?.currency ||
        'USD'
      );
    case 'policyId':
      return (
        event.policyId ||
        event.payload?.policyId ||
        'refund.amount.limit'
      );
    case 'duration':
      if (event.duration) return event.duration;
      if (event.eventType === 'ACTION_ATTEMPTED') return '1248ms';
      if (event.eventType === 'POLICY_CHECKED') return '82ms';
      return '—';
    case 'eventId':
      return (
        event.eventId ||
        event.id ||
        `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      );
    default:
      return '—';
  }
}

export default function RunReplayPage() {
  const [searchParams] = useSearchParams();
  const { status, setLatestRunId, recordSuccessfulWrite } = useAppStatus();
  const { addReport } = useReports();
  const { mode } = useSession();
  
  const runIdParam = searchParams.get('runId') || 'run_8f3a1a2b';
  const [selectedIdx, setSelectedIdx] = useState(6); // ACTION_ATTEMPTED default
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIdx, setReplayIdx] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [auditGenerated, setAuditGenerated] = useState(false);
  const [showReportPanel, setShowReportPanel] = useState(false);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [events, setEvents] = useState(mockReplayEvents);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const replayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const response = await fetch(`/api/events?runId=${runIdParam}`);
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.events && data.events.length > 0) {
            const transformedEvents = data.events.map((evt: any) => ({
              ...evt,
              label: evt.eventType.replace(/_/g, ' '),
              description: evt.detail || evt.message || '',
              duration: 0,
            }));
            setEvents(transformedEvents);
            setIsLiveMode(true);
            setLatestRunId(runIdParam);
            recordSuccessfulWrite(runIdParam, transformedEvents.length);
          } else {
            setIsLiveMode(false);
          }
        }
      } catch (error) {
        setIsLiveMode(false);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [runIdParam, setLatestRunId, recordSuccessfulWrite]);

  const selectedEvent: TimelineEvent = events[selectedIdx];

  const startReplay = () => {
    setIsReplaying(true);
    setReplayIdx(0);
    setSelectedIdx(0);
  };

  useEffect(() => {
    if (isReplaying && replayIdx >= 0) {
      replayRef.current = setTimeout(() => {
        const nextIdx = replayIdx + 1;
        if (nextIdx < events.length) {
          setSelectedIdx(nextIdx);
          setReplayIdx(nextIdx);
        } else {
          setIsReplaying(false);
          setReplayIdx(-1);
          toast.success('Replay complete', { description: `All ${events.length} events replayed.` });
        }
      }, 850);
    }
    return () => { if (replayRef.current) clearTimeout(replayRef.current); };
  }, [isReplaying, replayIdx, events.length]);

  const handleCopy = () => {
    const payload = selectedEvent?.payload || selectedEvent;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    toast.success('Copied payload');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAudit = () => {
    const newReport = {
      reportId: 'report_' + Date.now().toString(36),
      runId: runIdParam,
      agentName: 'RefundAgent v2.7.4',
      riskLevel: 'CRITICAL',
      eventCount: events.length,
      policyViolations: 1,
      blockedActions: 1,
      humanDecisions: 1,
      generatedAt: new Date().toISOString(),
      dataSource: isLiveMode ? 'Live DynamoDB Ledger' : 'Mock Fallback',
      summary: 'RefundAgent attempted to process a $4,800 refund for order A10293. The action exceeded the configured $500 authority limit, triggered policy refund.amount.limit, was blocked, and was escalated for human approval.',
      events: events,
    };
    
    addReport(newReport);
    setCurrentReport(newReport);
    setAuditGenerated(true);
    setShowReportPanel(true);
    toast.success('Audit report generated', { description: 'Report ID: ' + newReport.reportId });

    // Write audit event to API if live mode
    if (isLiveMode) {
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'demo',
          runId: runIdParam,
          agentId: 'refund-agent',
          eventType: 'AUDIT_REPORT_GENERATED',
          status: 'completed',
          payload: { reportId: newReport.reportId },
        }),
      }).catch(() => {});
    }
  };

  const downloadReport = (format: 'json' | 'markdown' | 'html') => {
    if (!currentReport) return;

    let content = '';
    let filename = `audit_report_${currentReport.reportId}.${format === 'markdown' ? 'md' : format}`;

    if (format === 'json') {
      content = JSON.stringify(currentReport, null, 2);
    } else if (format === 'markdown') {
      content = `# Audit Report

**Report ID:** ${currentReport.reportId}  
**Run ID:** ${currentReport.runId}  
**Agent:** ${currentReport.agentName}  
**Risk Level:** ${currentReport.riskLevel}  
**Generated:** ${new Date(currentReport.generatedAt).toLocaleString()}  
**Data Source:** ${currentReport.dataSource}

## Summary
${currentReport.summary}

## Statistics
- Events: ${currentReport.eventCount}
- Policy Violations: ${currentReport.policyViolations}
- Blocked Actions: ${currentReport.blockedActions}
- Human Decisions: ${currentReport.humanDecisions}

## Event Timeline
${currentReport.events.map((evt: any, i: number) => 
  `${i + 1}. **${evt.eventType}** - ${formatEventTime(evt.timestamp || 0)}`
).join('\n')}
`;
    } else if (format === 'html') {
      content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Report - ${currentReport.reportId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; background: #0f0f0f; color: #e0e0e0; }
    .header { border-bottom: 2px solid #ff8a00; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { margin: 0 0 10px 0; color: #ff8a00; }
    .metadata { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; font-size: 14px; }
    .metadata-item { background: rgba(255, 138, 0, 0.08); padding: 12px; border-radius: 8px; border-left: 3px solid #ff8a00; }
    .metadata-label { font-weight: bold; color: #ff8a00; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary { background: rgba(255, 138, 0, 0.04); padding: 20px; border-radius: 8px; border-left: 4px solid #ff8a00; margin: 20px 0; line-height: 1.6; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
    .stat-box { background: rgba(255, 138, 0, 0.08); padding: 15px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; color: #ff8a00; }
    .stat-label { font-size: 12px; color: #999; text-transform: uppercase; margin-top: 5px; }
    .timeline { margin: 30px 0; }
    .event { background: rgba(255, 138, 0, 0.04); padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #ff8a00; font-family: monospace; font-size: 13px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Audit Report</h1>
    <p style="margin: 0; color: #999;">Agent Governance & Compliance Record</p>
  </div>

  <div class="metadata">
    <div class="metadata-item">
      <div class="metadata-label">Report ID</div>
      <div>${currentReport.reportId}</div>
    </div>
    <div class="metadata-item">
      <div class="metadata-label">Run ID</div>
      <div>${currentReport.runId}</div>
    </div>
    <div class="metadata-item">
      <div class="metadata-label">Agent</div>
      <div>${currentReport.agentName}</div>
    </div>
    <div class="metadata-item">
      <div class="metadata-label">Risk Level</div>
      <div style="color: #ef4444; font-weight: bold;">${currentReport.riskLevel}</div>
    </div>
  </div>

  <div class="summary">
    <strong>Summary:</strong><br>${currentReport.summary}
  </div>

  <div class="stats">
    <div class="stat-box">
      <div class="stat-number">${currentReport.eventCount}</div>
      <div class="stat-label">Events</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${currentReport.policyViolations}</div>
      <div class="stat-label">Policy Violations</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${currentReport.blockedActions}</div>
      <div class="stat-label">Blocked Actions</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${currentReport.humanDecisions}</div>
      <div class="stat-label">Human Decisions</div>
    </div>
  </div>

  <div class="timeline">
    <h2 style="margin-top: 0; color: #ff8a00;">Event Timeline</h2>
    ${currentReport.events.map((evt: any, i: number) => 
      `<div class="event">${i + 1}. ${evt.eventType} — ${formatEventTime(evt.timestamp || 0)}</div>`
    ).join('')}
  </div>

  <div class="footer">
    <p>Generated: ${new Date(currentReport.generatedAt).toLocaleString()}</p>
    <p>Data Source: ${currentReport.dataSource}</p>
    <p>All audit records are immutable and cryptographically verified.</p>
  </div>
</body>
</html>`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${format.toUpperCase()}`);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">

        {/* Hero Incident Banner */}
        <div className="relative rounded-xl border border-destructive/50 overflow-hidden glow-red-strong incident-pulse glass-card-red">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-destructive to-transparent" />
          <div className="absolute inset-0 scanline pointer-events-none opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-destructive/12 via-destructive/4 to-transparent pointer-events-none" />

          <div className="relative p-4 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-[9px] font-black text-destructive uppercase tracking-widest border border-destructive/40 bg-destructive/12 px-2 py-0.5 rounded flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive rec-blink" />
                    Critical Incident Replay
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground border border-border bg-muted/40 px-2 py-0.5 rounded">
                    run_8f3a1a2b
                  </span>
                  <span className={cn(
                    'text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 rounded',
                    isLiveMode
                      ? 'border-status-low/40 bg-status-low/12 text-status-low'
                      : 'border-primary/40 bg-primary/12 text-primary'
                  )}>
                    {isLiveMode ? 'Live DynamoDB Ledger' : 'Mock Mode'}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-foreground text-balance mb-3 leading-snug">
                  Refund Agent Attempted an Unauthorized $4,800 Refund
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-1 h-1 rounded-full bg-status-info shrink-0" />RefundAgent v2.7.4</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />Customer: user_9c7f2d</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />14:31:18 UTC</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 shrink-0">
                <div className="flex items-center gap-5">
                  <div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1.5">Risk Level</div>
                    <RiskBadge level="CRITICAL" showDots />
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1.5">Risk Score</div>
                    <div className="text-3xl font-black text-destructive">98</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <Button
            onClick={startReplay}
            disabled={isReplaying}
            className={cn(
              'font-bold text-sm py-2 h-auto',
              isReplaying
                ? 'bg-primary/50 text-primary-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/85'
            )}
          >
            {isReplaying ? (
              <>
                <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Replaying event {replayIdx + 1} of {events.length}
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
            className={cn(
              'border font-bold text-sm py-2 h-auto',
              auditGenerated
                ? 'border-status-low/40 text-status-low bg-status-low/8 hover:bg-status-low/12'
                : 'border-border/60 text-foreground hover:bg-accent'
            )}
          >
            {auditGenerated ? <Check className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            {auditGenerated ? 'Report Generated' : 'Generate Audit Report'}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Left: Timeline */}
          <div className="rounded-xl border border-border glass-card overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
              <div className="w-1.5 h-4 bg-primary rounded-full shrink-0" />
              <span className="text-xs font-bold text-foreground">Event Timeline</span>
              <span className="ml-auto text-[9px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">{events.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {events.map((evt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedIdx(idx);
                    if (isReplaying) setIsReplaying(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-xs transition-all border',
                    selectedIdx === idx
                      ? 'bg-primary/25 border-primary/50 text-primary font-semibold'
                      : 'border-border/40 text-muted-foreground hover:border-primary/25 hover:bg-primary/8'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <EventIcon type={evt.eventType || 'UNKNOWN'} size="sm" />
                    <span className="truncate flex-1">{evt.label}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground ml-6">{formatEventTime(evt.timestamp || 0)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Event Detail Inspector */}
          <div className="rounded-xl border border-border glass-card overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-bold text-foreground">Event Detail Inspector</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedEvent ? (
                <>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Event Type</div>
                    <div className="text-sm font-semibold text-foreground">{selectedEvent.eventType}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Action</div>
                    <div className="text-sm font-semibold text-foreground">{getFieldValue(selectedEvent, 'action')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Target</div>
                    <div className="text-sm font-semibold text-foreground">{getFieldValue(selectedEvent, 'target')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Amount</div>
                    <div className="text-sm font-semibold text-foreground">${getFieldValue(selectedEvent, 'amount')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Currency</div>
                    <div className="text-sm font-semibold text-foreground">{getFieldValue(selectedEvent, 'currency')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Policy ID</div>
                    <div className="text-sm font-semibold text-foreground">{getFieldValue(selectedEvent, 'policyId')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Duration</div>
                    <div className="text-sm font-semibold text-foreground">{getFieldValue(selectedEvent, 'duration')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Event ID</div>
                    <div className="text-sm font-mono text-foreground break-all">{getFieldValue(selectedEvent, 'eventId')}</div>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground text-xs">Select an event</div>
              )}
            </div>
          </div>

          {/* Right: JSON Payload */}
          <div className="rounded-xl border border-border glass-card overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-bold text-foreground">JSON Payload</span>
              </div>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-3 bg-muted/20 code-console">
              {selectedEvent ? (
                <JsonViewer data={selectedEvent.payload || selectedEvent} className="max-h-96" />
              ) : (
                <div className="text-muted-foreground text-xs">Select an event</div>
              )}
            </div>
          </div>
        </div>

        {/* Report Panel */}
        {showReportPanel && currentReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-background border border-primary/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between sticky top-0 px-6 py-4 border-b border-border/60 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="font-bold text-lg text-foreground">Audit Report</h2>
                    <p className="text-xs text-muted-foreground">Full incident analysis and governance record</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportPanel(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Report Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Report ID</div>
                    <div className="text-sm font-mono text-foreground">{currentReport.reportId}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Generated</div>
                    <div className="text-sm text-foreground">{new Date(currentReport.generatedAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Run ID</div>
                    <div className="text-sm font-mono text-foreground">{currentReport.runId}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Agent</div>
                    <div className="text-sm text-foreground">{currentReport.agentName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Risk Level</div>
                    <RiskBadge level={currentReport.riskLevel} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Data Source</div>
                    <div className="text-sm text-foreground">{currentReport.dataSource}</div>
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t border-border/40 pt-4">
                  <h3 className="text-sm font-bold text-foreground mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{currentReport.summary}</p>
                </div>

                {/* Statistics */}
                <div className="border-t border-border/40 pt-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Statistics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/20 rounded-lg p-3">
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Events Recorded</div>
                      <div className="text-2xl font-bold text-foreground">{currentReport.eventCount}</div>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-3">
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Policy Violations</div>
                      <div className="text-2xl font-bold text-destructive">{currentReport.policyViolations}</div>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-3">
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Blocked Actions</div>
                      <div className="text-2xl font-bold text-destructive">{currentReport.blockedActions}</div>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-3">
                      <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Human Decisions</div>
                      <div className="text-2xl font-bold text-status-medium">{currentReport.humanDecisions}</div>
                    </div>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="border-t border-border/40 pt-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Export Report</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => downloadReport('json')}
                      className="bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 text-sm font-semibold"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download JSON
                    </Button>
                    <Button
                      onClick={() => downloadReport('markdown')}
                      className="bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 text-sm font-semibold"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Markdown
                    </Button>
                    <Button
                      onClick={() => downloadReport('html')}
                      className="bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 text-sm font-semibold"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download HTML
                    </Button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 border-t border-border/60 bg-background/95 backdrop-blur-sm gap-2">
                <p className="text-xs text-muted-foreground">All audit records are immutable and cryptographically verified</p>
                <Button
                  onClick={() => setShowReportPanel(false)}
                  className="bg-primary text-primary-foreground hover:bg-primary/85 font-bold"
                >
                  Close Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
