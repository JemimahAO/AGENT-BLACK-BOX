import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { RiskBadge, StatusBadge } from '@/components/ui/Badges';
import { EventIcon } from '@/components/ui/EventIcon';
import { mockReplayEvents } from '@/lib/mock/events';
import type { TimelineEvent } from '@/lib/types';
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

const JSON_PAYLOAD = {
  action: 'ProcessRefund',
  parameters: {
    orderId: 'A10293',
    amount: 4800,
    currency: 'USD',
    reason: 'Product not as described',
    refundMethod: 'original_payment_method',
  },
  agent: 'RefundAgent v2.7.4',
  sessionId: 'sess_3b7f9c2a',
  timestamp: '2026-06-09T14:31:18.456Z',
};

function formatEventTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function JsonViewer({ data, className }: { data: unknown; className?: string }) {
  const lines = JSON.stringify(data, null, 2).split('\n');
  return (
    <pre className={cn('text-[11px] mono leading-relaxed whitespace-pre-wrap break-words overflow-auto', className)}>
      {lines.map((line, i) => {
        // Color keys (amber), string values (green), numbers (blue), booleans (purple)
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

export default function RunReplayPage() {
  const [selectedIdx, setSelectedIdx] = useState(6); // ACTION_ATTEMPTED default
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIdx, setReplayIdx] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [auditGenerated, setAuditGenerated] = useState(false);
  const replayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedEvent: TimelineEvent = mockReplayEvents[selectedIdx];
  const isActionAttempted = selectedEvent.eventType === 'ACTION_ATTEMPTED';

  const startReplay = () => {
    setIsReplaying(true);
    setReplayIdx(0);
    setSelectedIdx(0);
    toast.info('Replay started', { description: 'Stepping through timeline events...' });
  };

  useEffect(() => {
    if (isReplaying && replayIdx >= 0) {
      replayRef.current = setTimeout(() => {
        const nextIdx = replayIdx + 1;
        if (nextIdx < mockReplayEvents.length) {
          setSelectedIdx(nextIdx);
          setReplayIdx(nextIdx);
        } else {
          setIsReplaying(false);
          setReplayIdx(-1);
          toast.success('Replay complete', { description: 'All 13 events replayed.' });
        }
      }, 800);
    }
    return () => { if (replayRef.current) clearTimeout(replayRef.current); };
  }, [isReplaying, replayIdx]);

  const handleCopy = () => {
    setCopied(true);
    toast.success('Payload copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAudit = () => {
    setAuditGenerated(true);
    toast.success('Audit report generated', { description: 'Report saved to immutable event ledger.' });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">

        {/* Hero Incident Banner — Flagship premium */}
        <div className="relative rounded-xl border border-destructive/50 overflow-hidden glow-red-strong incident-pulse glass-card-red">
          {/* Top red gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-destructive to-transparent" />
          {/* Scanline overlay */}
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
                  {/* Risk Score donut */}
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(220,38,38,0.18)" strokeWidth="6" />
                      <circle cx="32" cy="32" r="26" fill="none" stroke="#DC2626" strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 26 * 0.98} ${2 * Math.PI * 26}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-black text-destructive">98</span>
                      <span className="text-[9px] text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={startReplay}
                    disabled={isReplaying}
                    className="bg-primary text-primary-foreground hover:bg-primary/85 font-bold glow-amber-strong"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isReplaying ? 'Replaying...' : 'Replay Run'}
                  </Button>
                  <Button
                    onClick={handleGenerateAudit}
                    variant="ghost"
                    className={cn(
                      'border font-semibold',
                      auditGenerated
                        ? 'border-status-low/40 text-status-low bg-status-low/8 hover:bg-status-low/12'
                        : 'border-border/60 text-foreground hover:bg-accent'
                    )}
                  >
                    {auditGenerated ? <Check className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                    {auditGenerated ? 'Report Generated' : 'Generate Audit Report'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main 3-column layout */}
        <div className="grid lg:grid-cols-[220px_1fr_290px] gap-4 items-start">

          {/* Left: Timeline — Forensics playback */}
          <div className="rounded-xl border border-border glass-card overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60"
              style={{ background: 'rgba(255,138,0,0.04)' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-4 bg-primary rounded-full shrink-0" />
                <span className="text-xs font-bold text-foreground">Event Timeline</span>
              </div>
              <span className="text-[10px] text-muted-foreground mono">02:14.902</span>
            </div>
            <div className="relative">
              {/* Vertical glow line */}
              <div className="absolute left-[26px] top-0 bottom-0 w-px timeline-line-glow" />
              <div className="py-1.5 space-y-0">
                {mockReplayEvents.map((evt, idx) => {
                  const isSelected = idx === selectedIdx;
                  const isActive = isReplaying && idx === replayIdx;
                  const isCrit = evt.riskLevel === 'CRITICAL';
                  return (
                    <button
                      key={evt.eventId}
                      onClick={() => { setSelectedIdx(idx); setIsReplaying(false); }}
                      className={cn(
                        'w-full flex items-start gap-2 px-2.5 py-2 text-left transition-all duration-150 relative',
                        isSelected
                          ? 'bg-primary/14 border-r-2 border-primary'
                          : 'hover:bg-accent/40 border-r-2 border-transparent',
                        isActive && 'bg-primary/22',
                        isCrit && !isSelected && 'bg-destructive/4'
                      )}
                    >
                      <div className={cn('relative z-10 shrink-0 mt-1 w-5 h-5 rounded-full border flex items-center justify-center',
                        isSelected
                          ? 'bg-primary/20 border-primary timeline-node-active'
                          : isCrit
                          ? 'bg-destructive/15 border-destructive/40'
                          : 'bg-muted border-border'
                      )}>
                        <EventIcon eventType={evt.eventType} size="sm"
                          className={cn('w-3 h-3', isSelected ? 'text-primary' : isCrit ? 'text-destructive' : 'text-muted-foreground')} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={cn('text-[11px] font-semibold truncate leading-tight', isSelected ? 'text-primary' : isCrit ? 'text-status-critical' : 'text-foreground')}>
                          {evt.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">{evt.detail}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center: Event Detail Inspector */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border glass-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60"
                style={{ background: selectedEvent.riskLevel === 'CRITICAL' ? 'rgba(220,38,38,0.04)' : 'rgba(255,138,0,0.04)' }}>
                <div className="flex items-center gap-2">
                  <div className={cn('w-1.5 h-4 rounded-full shrink-0',
                    selectedEvent.riskLevel === 'CRITICAL' ? 'bg-destructive' : 'bg-primary')} />
                  <span className="text-sm font-bold text-foreground">Event Detail Inspector</span>
                </div>
                {selectedEvent.riskLevel === 'CRITICAL' && (
                  <span className="text-[9px] font-black text-destructive border border-destructive/35 bg-destructive/12 px-2 py-0.5 rounded flex items-center gap-1 tracking-wider">
                    <span className="w-1 h-1 rounded-full bg-destructive rec-blink" />
                    CRITICAL EVENT
                  </span>
                )}
              </div>
              <div className="p-4 space-y-2.5">
                {[
                  { label: 'Event Type', value: selectedEvent.eventType.replace(/_/g, ' '), bold: true },
                  { label: 'Timestamp', value: formatEventTime(selectedEvent.timestamp), mono: true },
                  { label: 'Agent', value: selectedEvent.agentName + ' v2.7.4' },
                  { label: 'Action', value: selectedEvent.action ?? '—' },
                  ...(isActionAttempted ? [
                    { label: 'Target', value: 'Order #A10293' },
                    { label: 'Amount', value: '$4,800.00 USD', critical: true },
                    { label: 'Status', value: 'Blocked', badge: 'BLOCKED' as const },
                  ] : []),
                  { label: 'Duration', value: selectedEvent.duration ? `${selectedEvent.duration}ms` : '—', mono: true },
                  { label: 'Event ID', value: selectedEvent.eventId, mono: true, small: true },
                ].map(({ label, value, bold, mono, critical, badge, small }) => (
                  <div key={label} className="flex items-start gap-3 py-1 border-b border-border/20 last:border-0">
                    <span className="text-[11px] text-muted-foreground w-24 shrink-0 pt-0.5">{label}</span>
                    {badge ? (
                      <StatusBadge status={badge} />
                    ) : (
                      <span className={cn(
                        'flex-1 min-w-0',
                        bold && 'font-bold text-foreground text-sm',
                        mono && 'mono text-xs text-foreground',
                        critical && 'font-black text-destructive text-sm',
                        !bold && !mono && !critical && 'text-xs text-foreground',
                        small && 'text-[10px] break-all',
                      )}>
                        {value}
                      </span>
                    )}
                  </div>
                ))}
                {selectedEvent.description && (
                  <div className="pt-2 border-t border-border/40">
                    <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">Context</div>
                    <p className="text-xs text-muted-foreground text-pretty leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Memory State Diff */}
            <div className="rounded-xl border border-border glass-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/60"
                style={{ background: 'rgba(255,138,0,0.04)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-secondary rounded-full shrink-0" />
                  <span className="text-sm font-bold text-foreground">Memory State Diff</span>
                  <span className="text-[9px] text-muted-foreground border border-border bg-muted/40 px-1.5 py-0.5 rounded mono ml-auto">Before → After</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-secondary uppercase tracking-widest mb-2.5 pb-1.5 border-b border-secondary/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      Before Event
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(MEMORY_BEFORE).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-2 text-[10px] py-0.5">
                          <span className="text-muted-foreground mono truncate leading-tight">{k}</span>
                          <span className="text-foreground mono shrink-0 font-medium">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-destructive uppercase tracking-widest mb-2.5 pb-1.5 border-b border-destructive/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive rec-blink" />
                      After (Blocked)
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(MEMORY_AFTER).map(([k, v]) => {
                        const isNew = CHANGED_KEYS.includes(k);
                        const isChanged = k in MEMORY_BEFORE && MEMORY_BEFORE[k] !== v;
                        return (
                          <div key={k} className={cn(
                            'flex justify-between gap-2 text-[10px] rounded px-1 py-0.5',
                            isNew && 'bg-destructive/12 border-l-2 border-destructive',
                            isChanged && 'bg-status-medium/10',
                          )}>
                            <span className={cn('mono truncate leading-tight', isNew ? 'text-destructive' : 'text-muted-foreground')}>
                              {isNew && '+ '}{k}
                            </span>
                            <span className={cn('mono shrink-0 font-medium', isNew ? 'text-destructive font-bold' : 'text-foreground')}>
                              {String(v)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: JSON Console + Policy Violation + Human Approval */}
          <div className="space-y-4">
            {/* JSON Payload Console */}
            <div className="rounded-xl overflow-hidden border border-primary/20">
              {/* Console titlebar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-primary/15 bg-primary/6">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-destructive/60" />
                    <span className="w-2 h-2 rounded-full bg-status-medium/60" />
                    <span className="w-2 h-2 rounded-full bg-status-low/60" />
                  </div>
                  <span className="text-[10px] text-primary/80 mono font-bold ml-1">action.payload.json</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCopy}
                  className="h-6 px-2 text-[10px] text-muted-foreground hover:text-primary border border-transparent hover:border-primary/20">
                  {copied ? <Check className="w-3 h-3 mr-1 text-status-low" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="code-console p-3.5 max-h-56 overflow-y-auto">
                <JsonViewer data={isActionAttempted ? JSON_PAYLOAD : (selectedEvent.payload ?? {})} />
              </div>
            </div>

            {/* Policy Violation Evidence — Serious and critical */}
            <div className="rounded-xl overflow-hidden glow-red glass-card-red border border-destructive/40">
              {/* Red top bar */}
              <div className="h-0.5 bg-gradient-to-r from-transparent via-destructive to-transparent" />
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-destructive/25 bg-destructive/8">
                <div className="w-6 h-6 rounded-md bg-destructive/20 border border-destructive/35 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-destructive" />
                </div>
                <span className="text-xs font-black text-foreground">Policy Violation Evidence</span>
                <span className="text-[9px] font-black text-destructive border border-destructive/30 bg-destructive/12 px-1.5 py-0.5 rounded tracking-widest ml-auto">
                  BLOCKED
                </span>
              </div>
              <div className="p-3.5 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-destructive rounded-full shrink-0" />
                  <div className="text-sm font-bold text-foreground">Unauthorized Refund Amount</div>
                </div>
                <RiskBadge level="CRITICAL" />
                <div className="space-y-1.5 pt-1 border-t border-destructive/15 mt-2">
                  {[
                    { label: 'Policy', value: 'refund.amount.limit', mono: true },
                    { label: 'Rule', value: 'amount <= 500.00', mono: true },
                    { label: 'Limit', value: '$500.00 USD' },
                    { label: 'Attempted', value: '$4,800.00 USD', critical: true },
                    { label: 'Severity', value: 'Critical', critical: true },
                    { label: 'Policy ID', value: 'pol_7c9d2e1f', mono: true, small: true },
                  ].map(({ label, value, mono, critical, small }) => (
                    <div key={label} className="flex justify-between gap-2 text-[11px]">
                      <span className="text-muted-foreground">{label}</span>
                      <span className={cn(
                        'text-right',
                        mono && 'mono',
                        critical && 'text-destructive font-bold',
                        !mono && !critical && 'text-foreground',
                        small && 'text-[10px]',
                      )}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Human Approval Status — Visually distinct */}
            <div className="rounded-xl overflow-hidden border border-secondary/25 glass-card-blue">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-secondary/20 bg-secondary/6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-secondary/15 border border-secondary/30 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <span className="text-xs font-bold text-foreground">Human Approval</span>
                </div>
                <StatusBadge status="DENIED" />
              </div>
              <div className="p-3.5 space-y-2">
                {[
                  { label: 'Requested By', value: 'System (Policy Engine)' },
                  { label: 'Requested At', value: '14:31:22' },
                  { label: 'Approver Group', value: 'Finance Team' },
                  { label: 'SLA', value: '15m 00s' },
                  { label: 'Status', value: 'Denied' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2 text-[11px]">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground text-right font-medium">{value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-secondary/15 mt-1">
                  <div className="text-[9px] text-secondary/70 uppercase tracking-widest font-bold mb-1.5">Decision Note</div>
                  <p className="text-[11px] text-muted-foreground text-pretty leading-relaxed">
                    Refund denied because it exceeded the agent authority limit. Customer must contact senior support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Summary Bar */}
        <div className="rounded-xl border border-border glass-card">
          {/* Amber top accent */}
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex flex-wrap items-center gap-4 md:gap-0 px-4 py-3">
            {[
              { label: 'Run Duration', value: '02:14.902', color: 'text-foreground', icon: Clock },
              { label: 'Total Events', value: '13', color: 'text-foreground', icon: null },
              { label: 'Violations', value: '2', color: 'text-destructive', icon: AlertTriangle },
              { label: 'Blocked', value: '1', color: 'text-destructive', icon: XCircle },
              { label: 'Human Interventions', value: '1', color: 'text-primary', icon: null },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <div className="w-px h-8 bg-border hidden md:block mx-6" />}
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-0.5">{item.label}</div>
                  <div className={cn('text-sm font-black mono flex items-center gap-1', item.color)}>
                    {item.value}
                    {item.icon && <item.icon className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </React.Fragment>
            ))}
            <div className="flex-1" />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => {}}
                className="border border-border hover:border-primary/30 hover:bg-primary/5 text-xs text-muted-foreground hover:text-primary">
                <ChevronLeft className="w-3 h-3 mr-1" />Previous
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {}}
                className="border border-border hover:border-primary/30 hover:bg-primary/5 text-xs text-muted-foreground hover:text-primary">
                Next<ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
