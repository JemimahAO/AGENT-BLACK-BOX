import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { RiskBadge, StatusBadge } from '@/components/ui/Badges';
import { mockApprovals } from '@/lib/mock/approvals';
import { computeApprovalStats } from '@/lib/approvals';
import type { ApprovalRequest } from '@/lib/types';
import { useAppStatus } from '@/contexts/AppStatusContext';
import {
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Denied'] as const;
type Tab = typeof STATUS_TABS[number];

export default function ApprovalsPage() {
  const { status, setPendingApprovalsCount } = useAppStatus();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(mockApprovals);
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const handleApprove = (approvalId: string) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.approvalId === approvalId
          ? { ...a, status: 'APPROVED', decidedAt: new Date().toISOString(), decisionNote: notes[approvalId] ?? 'Approved.' }
          : a
      )
    );
    setPendingApprovalsCount((prev) => Math.max(0, prev - 1));
    toast.success('Approval approved', { description: 'Decision logged to event ledger.' });
  };

  const handleDeny = (approvalId: string) => {
    setApprovals((prev) =>
      prev.map((a) =>
        a.approvalId === approvalId
          ? { ...a, status: 'DENIED', decidedAt: new Date().toISOString(), decisionNote: notes[approvalId] ?? 'Denied by reviewer.' }
          : a
      )
    );
    setPendingApprovalsCount((prev) => Math.max(0, prev - 1));
    toast.error('Approval denied', { description: 'Decision logged to event ledger.' });
  };

  const filtered = approvals.filter((a) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Pending') return a.status === 'PENDING';
    if (activeTab === 'Approved') return a.status === 'APPROVED';
    if (activeTab === 'Denied') return a.status === 'DENIED';
    return true;
  });

  // Compute stats dynamically from current approvals
  const stats = useMemo(() => computeApprovalStats(approvals), [approvals]);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pending', count: stats.pending, color: 'text-primary', bg: 'bg-primary/8 border-primary/25', icon: Clock, glow: 'glow-amber' },
            { label: 'Approved (7d)', count: stats.approved, color: 'text-status-low', bg: 'bg-status-low/8 border-status-low/22', icon: CheckCircle, glow: 'glow-green' },
            { label: 'Denied (7d)', count: stats.denied, color: 'text-destructive', bg: 'bg-destructive/8 border-destructive/22', icon: XCircle, glow: 'glow-red' },
          ].map(({ label, count, color, bg, icon: Icon, glow }) => (
            <div key={label} className={cn('rounded-xl border p-4 flex items-center gap-3 h-full glass-card', bg, glow)}>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center border shrink-0', bg)}>
                <Icon className={cn('w-4.5 h-4.5', color)} />
              </div>
              <div>
                <div className={cn('text-2xl font-black mono', color)}>{count}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {stats.pending > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/8 px-4 py-3 glow-amber">
            <AlertTriangle className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-bold text-primary">{stats.pending} approval{stats.pending > 1 ? 's' : ''} awaiting decision</span>
              {' '}— high-risk agent actions are blocked, pending human review.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5 w-fit">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-150',
                activeTab === tab
                  ? 'bg-card text-foreground border border-border shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              )}
            >
              {tab}
              {tab === 'Pending' && stats.pending > 0 && (
                <span className="ml-1.5 min-w-[18px] h-[18px] rounded-full bg-primary/20 text-primary text-[9px] inline-flex items-center justify-center px-1 font-black">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Approval Cards */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">No approvals found for this filter.</div>
          )}
          {filtered.map((approval) => (
            <ApprovalCard
              key={approval.approvalId}
              approval={approval}
              note={notes[approval.approvalId] ?? ''}
              onNoteChange={(val) => setNotes((prev) => ({ ...prev, [approval.approvalId]: val }))}
              onApprove={() => handleApprove(approval.approvalId)}
              onDeny={() => handleDeny(approval.approvalId)}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function ApprovalCard({ approval, note, onNoteChange, onApprove, onDeny }: {
  approval: ApprovalRequest;
  note: string;
  onNoteChange: (val: string) => void;
  onApprove: () => void;
  onDeny: () => void;
}) {
  const isPending = approval.status === 'PENDING';
  const isApproved = approval.status === 'APPROVED';
  const isDenied = approval.status === 'DENIED';

  return (
    <div className={cn(
      'rounded-xl border glass-card overflow-hidden transition-all duration-150',
      isPending && 'border-primary/30 glow-amber',
      isApproved && 'border-status-low/22',
      isDenied && 'border-destructive/22',
    )}>
      {/* State top accent bar */}
      <div className={cn('h-0.5',
        isPending && 'bg-gradient-to-r from-transparent via-primary to-transparent',
        isApproved && 'bg-gradient-to-r from-transparent via-status-low to-transparent',
        isDenied && 'bg-gradient-to-r from-transparent via-destructive to-transparent',
      )} />

      <div className={cn('px-4 py-2.5 border-b flex items-center justify-between',
        isPending && 'border-primary/15 bg-primary/5',
        isApproved && 'border-status-low/12 bg-status-low/4',
        isDenied && 'border-destructive/15 bg-destructive/5',
      )}>
        <div className="flex items-center gap-2.5">
          <StatusBadge status={approval.status} />
          <RiskBadge level={approval.riskLevel} showDots />
          <span className="text-[10px] mono text-muted-foreground border border-border bg-muted/40 px-1.5 py-0.5 rounded hidden md:inline">{approval.approvalId}</span>
        </div>
        {isPending && <span className="text-[9px] font-black text-primary border border-primary/30 bg-primary/10 px-1.5 py-0.5 rounded tracking-widest flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary rec-blink" />AWAITING</span>}
      </div>

      <div className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-start gap-5">
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <div className="text-base font-black text-foreground text-balance">{approval.agentName}</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                Action: <span className="font-semibold text-foreground">{approval.action.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-28 shrink-0">Customer/Entity</span>
                  <span className="text-foreground mono">{approval.affectedEntity}</span>
                </div>
                {approval.amount && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-28 shrink-0">Amount</span>
                    <span className="text-destructive font-bold">${approval.amount.toLocaleString()} {approval.currency}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-28 shrink-0">Approver Group</span>
                  <span className="text-foreground">{approval.approverGroup}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-28 shrink-0">Requested</span>
                  <span className="text-foreground mono">{new Date(approval.requestedAt).toLocaleTimeString('en-US', { hour12: false })}</span>
                </div>
                {approval.decidedAt && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-28 shrink-0">Decided</span>
                    <span className="text-foreground mono">{new Date(approval.decidedAt).toLocaleTimeString('en-US', { hour12: false })}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border/40 bg-muted/25 px-3 py-2.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">Policy Reason</div>
              <p className="text-xs text-muted-foreground text-pretty leading-relaxed">{approval.policyReason}</p>
            </div>

            {approval.decisionNote && !isPending && (
              <div className={cn(
                'rounded-lg border px-3 py-2.5 border-left-amber',
                isApproved ? 'border-status-low/25 bg-status-low/6 border-l-status-low' : 'border-destructive/25 bg-destructive/6 border-l-destructive'
              )}>
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mb-1.5">Decision Note</div>
                <p className="text-xs text-foreground text-pretty">{approval.decisionNote}</p>
                {approval.decidedBy && (
                  <p className="text-[10px] text-muted-foreground mt-1 mono">— {approval.decidedBy}</p>
                )}
              </div>
            )}
          </div>

          {isPending && (
            <div className="flex flex-col gap-2.5 shrink-0 md:w-52">
              <div>
                <label className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold block mb-1.5">Decision Note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => onNoteChange(e.target.value)}
                  rows={3}
                  placeholder="Add a note for the audit record..."
                  className="w-full text-xs bg-muted/40 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:border-primary/50 focus:bg-muted/60 transition-colors"
                />
              </div>
              <Button
                onClick={onApprove}
                className="w-full bg-status-low/15 border border-status-low/35 text-status-low hover:bg-status-low/25 font-bold"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={onDeny}
                className="w-full bg-destructive/12 border border-destructive/35 text-destructive hover:bg-destructive/22 font-bold"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Deny
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
