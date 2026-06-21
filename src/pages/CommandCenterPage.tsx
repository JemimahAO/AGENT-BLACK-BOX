import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { RiskBadge, StatusBadge } from '@/components/ui/Badges';
import { EventIcon } from '@/components/ui/EventIcon';
import {
  AlertTriangle,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Database,
  Activity,
  ChevronRight,
  Eye,
  Lock,
} from 'lucide-react';
import {
  mockCommandCenterMetrics,
  mockSystemHealth,
  mockDatabaseLedgerHealth,
  mockRiskDistribution,
  mockReplayQueue,
} from '@/lib/mock/reports';
import { mockRuns } from '@/lib/mock/runs';
import { mockApprovals } from '@/lib/mock/approvals';
import { mockLiveEvents } from '@/lib/mock/events';
import { computePendingApprovalsCount, getApprovalsDataSource } from '@/lib/approvals';
import {
  getTotalActiveRuns,
  getHighRiskRunsCount,
  getBlockedActionsCount,
  getPendingApprovalsCount,
  getHighestSeverityRun,
  getRiskDistribution,
} from '@/lib/metrics';
import {
  pickRandomAgent,
  pickRandomScenario,
  generateSimulatedEvent,
} from '@/lib/simulation/eventFactory';
import type { AgentEvent, AgentRun, RiskLevel } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

function formatTimeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function MetricCard({ title, value, delta, icon: Icon, iconColor, trend, glowClass }: {
  title: string;
  value: string | number;
  delta: string | number;
  icon: React.ElementType;
  iconColor: string;
  trend?: 'up' | 'down' | 'neutral';
  glowClass?: string;
}) {
  return (
    <div className={cn('relative p-4 rounded-xl border glass-card h-full flex flex-col overflow-hidden', glowClass)}>
      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-5 rounded-bl-full" style={{ background: 'var(--tw-shadow-color, currentColor)' }} />
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center border', iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{title}</span>
      </div>
      <div className="text-3xl font-black text-foreground mono leading-none">{value}</div>
      <div className={cn(
        'flex items-center gap-1 text-xs mt-2',
        trend === 'up' ? 'text-status-low' : trend === 'down' ? 'text-status-critical' : 'text-muted-foreground'
      )}>
        {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
        <span>{delta}</span>
      </div>
    </div>
  );
}

export default function CommandCenterPage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveEvents, setLiveEvents] = useState<(AgentEvent & { displayTime: string })[]>(
    mockLiveEvents.map((e, i) => ({
      ...e,
      eventId: `init_${i}`,
      tenantId: 'demo',
      agentId: e.agentName.toLowerCase().replace(/\s+/g, '-'),
      runId: `run_init_${i}`,
      status: 'OK',
      timestamp: new Date().toISOString(),
      displayTime: e.time,
      description: e.description,
    }))
  );
  const [runs, setRuns] = useState<AgentRun[]>(mockRuns.slice(0, 8));
  const [metrics, setMetrics] = useState(mockCommandCenterMetrics);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Compute metrics from mock data
  const computedMetrics = useMemo(() => {
    return {
      totalActiveRuns: getTotalActiveRuns(mockRuns),
      highRiskRuns: getHighRiskRunsCount(mockRuns),
      blockedActions: getBlockedActionsCount(mockRuns),
      pendingApprovals: getPendingApprovalsCount(mockApprovals),
      highestSeverityRun: getHighestSeverityRun(mockRuns),
      riskDistribution: getRiskDistribution(mockRuns),
    };
  }, []);

  // Compute pending approvals count dynamically
  const pendingApprovalsCount = useMemo(() => {
    return computedMetrics.pendingApprovals;
  }, [computedMetrics]);

  const runSimulationStep = useCallback(() => {
    const agent = pickRandomAgent();
    const scenario = pickRandomScenario(agent);
    if (!scenario.events.length) return;
    const eventDef = scenario.events[Math.floor(Math.random() * scenario.events.length)];
    const event = generateSimulatedEvent(agent, scenario, eventDef);
    const now = new Date();

    setLiveEvents((prev) => [
      {
        ...event,
        displayTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
      },
      ...prev.slice(0, 19),
    ]);

    setMetrics((prev) => ({
      ...prev,
      totalAgentRuns: prev.totalAgentRuns + 1,
      highRiskRuns: event.riskLevel === 'CRITICAL' || event.riskLevel === 'HIGH' ? prev.highRiskRuns + 1 : prev.highRiskRuns,
      blockedActions: event.status === 'BLOCKED' ? prev.blockedActions + 1 : prev.blockedActions,
      pendingApprovals: event.eventType === 'HUMAN_APPROVAL_REQUESTED' ? prev.pendingApprovals + 1 : prev.pendingApprovals,
    }));

    if (event.riskLevel === 'CRITICAL' && Math.random() > 0.6) {
      toast.error(`Critical event: ${event.eventType}`, {
        description: `${agent.agentName} · ${eventDef.description}`,
        duration: 4000,
      });
    }
  }, []);

  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    toast.success('Live simulation started', { description: 'Agent events are now streaming in real time.' });
    simIntervalRef.current = setInterval(runSimulationStep, 1500);
  }, [runSimulationStep]);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    toast.info('Simulation paused');
  }, []);

  useEffect(() => {
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, []);

  const riskColors: Record<RiskLevel, string> = {
    CRITICAL: '#DC2626',
    HIGH: '#EA580C',
    MEDIUM: '#CA8A04',
    LOW: '#16A34A',
    INFO: '#3B82F6',
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-5">

        {/* Active Incident Banner — Cinematic */}
        {computedMetrics.highestSeverityRun && (
          <div className="relative rounded-xl border border-destructive/50 overflow-hidden incident-pulse glass-card-red">
            {/* Background gradient sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/15 via-destructive/5 to-transparent pointer-events-none" />
            {/* Scanline overlay */}
            <div className="absolute inset-0 scanline pointer-events-none opacity-40" />
            {/* Top red accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-destructive/80 via-destructive to-destructive/80" />

            <div className="relative p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Left: Icon + text */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Radar circle */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-12 h-12 rounded-full bg-destructive/15 border-2 border-destructive/50 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    {/* Radar ping rings */}
                    <div className="absolute inset-0 rounded-full border border-destructive/30 radar-ping" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-destructive uppercase tracking-widest">⬤ {computedMetrics.highestSeverityRun.status} — Active</span>
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-foreground text-balance leading-snug">
                      {computedMetrics.highestSeverityRun.summary}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[10px] mono text-muted-foreground border border-border bg-muted/50 px-1.5 py-0.5 rounded">{computedMetrics.highestSeverityRun.runId}</span>
                      <span className="text-[10px] mono text-primary">{computedMetrics.highestSeverityRun.agentName} {computedMetrics.highestSeverityRun.agentVersion}</span>
                      <span className="text-[10px] text-muted-foreground">{formatTimeAgo(computedMetrics.highestSeverityRun.startedAt)} · {computedMetrics.highestSeverityRun.blockedActions} action{computedMetrics.highestSeverityRun.blockedActions !== 1 ? 's' : ''} blocked</span>
                    </div>
                  </div>
                </div>
                {/* Right: Metrics + Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center md:flex-col lg:flex-row shrink-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Risk</div>
                      <RiskBadge level={computedMetrics.highestSeverityRun.riskLevel} showDots />
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Detected</div>
                      <div className="text-sm font-bold text-foreground mono">{formatTimeAgo(computedMetrics.highestSeverityRun.startedAt)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => {}} className="bg-destructive text-destructive-foreground hover:bg-destructive/80 font-semibold glow-red">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                      Investigate
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="border border-destructive/30 text-destructive hover:bg-destructive/10">
                      <Link to={`/run-replay?runId=${computedMetrics.highestSeverityRun.runId}`}>
                        <Play className="w-3.5 h-3.5 mr-1.5" />
                        Replay
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Control — Central and prominent */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between px-4 py-3 rounded-xl border glass-card"
          style={{ borderColor: isSimulating ? 'rgba(34,197,94,0.25)' : 'rgba(255,138,0,0.20)' }}>
          <div className="flex items-center gap-3">
            {isSimulating ? (
              <div className="live-dot shrink-0" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
            )}
            <div>
              <div className={cn('text-xs font-semibold', isSimulating ? 'text-status-healthy' : 'text-foreground')}>
                {isSimulating ? 'Live Simulation Running' : 'Live Simulation Ready'}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {isSimulating ? 'Real-time agent events streaming — 12 active agents' : 'Start to simulate real-time agent activity across all scenarios'}
              </div>
            </div>
          </div>
          <Button
            onClick={isSimulating ? stopSimulation : startSimulation}
            className={cn(
              'font-bold shrink-0',
              isSimulating
                ? 'bg-muted border border-border text-foreground hover:bg-accent'
                : 'bg-primary text-primary-foreground hover:bg-primary/85 glow-amber'
            )}
          >
            {isSimulating ? (
              <><Pause className="w-4 h-4 mr-2" />Pause Simulation</>
            ) : (
              <><Play className="w-4 h-4 mr-2" />Start Live Simulation</>
            )}
          </Button>
        </div>

        {/* Metrics — Data source badge showing "DEMO DATASET" */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted-foreground">Key Metrics from Demo Dataset</div>
          <span className="text-[9px] font-black text-primary border border-primary/30 bg-primary/10 px-2 py-1 rounded tracking-widest">
            DEMO DATASET
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            title="Agent Runs"
            value={mockRuns.length.toLocaleString()}
            delta={`Total runs in dataset`}
            icon={Activity}
            iconColor="bg-secondary/15 border-secondary/25 text-secondary"
            trend="neutral"
            glowClass="border-secondary/15"
          />
          <MetricCard
            title="High-Risk Runs"
            value={computedMetrics.highRiskRuns}
            delta={`CRITICAL + HIGH risk levels`}
            icon={Shield}
            iconColor="bg-destructive/15 border-destructive/25 text-destructive"
            trend={computedMetrics.highRiskRuns > 0 ? 'down' : 'neutral'}
            glowClass="border-destructive/15"
          />
          <MetricCard
            title="Pending Approvals"
            value={computedMetrics.pendingApprovals}
            delta={`Awaiting approval`}
            icon={Clock}
            iconColor="bg-primary/15 border-primary/25 text-primary"
            trend="neutral"
            glowClass="border-primary/15 glow-amber"
          />
          <MetricCard
            title="Blocked Actions"
            value={computedMetrics.blockedActions}
            delta={`Policy enforcement blocks`}
            icon={Lock}
            iconColor="bg-status-high/15 border-status-high/25 text-status-high"
            trend="neutral"
            glowClass="border-status-high/15"
          />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-4 md:gap-5">

          {/* Recent Agent Runs */}
          <div className="lg:col-span-2 rounded-xl border border-border glass-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60"
              style={{ background: 'rgba(255,138,0,0.04)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-primary rounded-full shrink-0" />
                <h3 className="text-sm font-bold text-foreground">Recent Agent Runs</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => {}} className="text-xs text-muted-foreground hover:text-primary">
                View all <ChevronRight className="w-3 h-3 ml-0.5" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="border-b border-border/40">
                    {['Time', 'Agent', 'Run ID', 'Status', 'Risk', 'Policies', 'Action'].map((h) => (
                      <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 py-2.5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run, i) => (
                    <tr key={run.runId} className={cn(
                      'border-b border-border/25 hover:bg-primary/5 transition-colors group',
                      run.riskLevel === 'CRITICAL' && 'bg-destructive/3'
                    )}>
                      <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap mono">
                        {formatTimeAgo(run.startedAt)}
                      </td>
                      <td className="px-3 py-3 text-xs text-foreground whitespace-nowrap font-semibold">
                        {run.agentName}
                      </td>
                      <td className="px-3 py-3 text-xs text-primary mono whitespace-nowrap">
                        {run.runId}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <RiskBadge level={run.riskLevel} showDots />
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap mono">
                        {run.triggeredPolicies}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Button asChild variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/12 h-7 px-2 opacity-70 group-hover:opacity-100 font-semibold">
                          <Link to={`/run-replay?runId=${run.runId}`}>Replay <ChevronRight className="w-3 h-3 ml-0.5" /></Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Event Feed */}
          <div className="rounded-xl border border-border glass-card overflow-hidden flex flex-col h-[420px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0"
              style={{ background: 'rgba(255,138,0,0.04)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-status-info rounded-full shrink-0" />
                <h3 className="text-sm font-bold text-foreground">Live Event Feed</h3>
              </div>
              <div className="flex items-center gap-1.5">
                {isSimulating ? (
                  <div className="live-dot" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                )}
                <span className={cn('text-[10px] font-bold', isSimulating ? 'text-status-healthy' : 'text-muted-foreground')}>
                  {isSimulating ? 'LIVE' : 'PAUSED'}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {liveEvents.map((event, i) => {
                const isCrit = event.riskLevel === 'CRITICAL';
                return (
                  <div
                    key={event.eventId}
                    className={cn(
                      'flex items-start gap-2.5 px-3 py-2.5 border-b border-border/20 hover:bg-accent/20 transition-colors relative',
                      i === 0 && isSimulating && 'slide-in-top',
                      isCrit && 'bg-destructive/5 border-b-destructive/15'
                    )}
                  >
                    {/* Vertical dot + line connector */}
                    <div className="flex flex-col items-center shrink-0 pt-1 gap-0.5">
                      <span className={cn(
                        'w-2 h-2 rounded-full border shrink-0',
                        isCrit ? 'bg-destructive border-destructive/50' :
                        event.riskLevel === 'HIGH' ? 'bg-status-high border-status-high/50' :
                        'bg-border border-border'
                      )} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground mono shrink-0">{event.displayTime}</span>
                        <EventIcon eventType={event.eventType} size="sm" className="shrink-0" />
                      </div>
                      <div className="text-xs font-semibold text-foreground truncate mt-0.5">
                        {event.eventType.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {event.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {/* Risk Distribution */}
          <div className="rounded-xl border border-border glass-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60"
              style={{ background: 'rgba(255,138,0,0.04)' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-destructive rounded-full shrink-0" />
                <h3 className="text-sm font-bold text-foreground">Risk Distribution</h3>
              </div>
            </div>
            <div className="p-4">
              {useMemo(() => {
                const riskDist = computedMetrics.riskDistribution;
                const total = Object.values(riskDist).reduce((a, b) => a + b, 0);
                const chartData = [
                  { name: 'CRITICAL', value: riskDist.CRITICAL, color: '#DC2626' },
                  { name: 'HIGH', value: riskDist.HIGH, color: '#EA580C' },
                  { name: 'MEDIUM', value: riskDist.MEDIUM, color: '#CA8A04' },
                  { name: 'LOW', value: riskDist.LOW, color: '#16A34A' },
                  { name: 'INFO', value: riskDist.INFO, color: '#3B82F6' },
                ].filter(d => d.value > 0);

                return (
                  <>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="40%"
                            cy="50%"
                            innerRadius={44}
                            outerRadius={64}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {chartData.map((entry, i) => (
                              <Cell key={`cell-${i}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#060810', border: '1px solid rgba(255,138,0,0.22)', borderRadius: '8px', fontSize: '11px' }}
                            labelStyle={{ color: '#e0e6f0' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-2 space-y-1.5">
                      {chartData.map((r) => (
                        <div key={r.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                            <span className="text-muted-foreground">{r.name}</span>
                          </div>
                          <span className="text-foreground font-semibold mono">{total > 0 ? Math.round((r.value / total) * 100) : 0}% ({r.value.toLocaleString()})</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              }, [computedMetrics.riskDistribution])}
            </div>
          </div>

          {/* Database Ledger Health — Featured product card */}
          <div className="rounded-xl border border-primary/25 glass-card overflow-hidden glow-amber">
            {/* Top amber accent bar */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/15"
              style={{ background: 'rgba(255,138,0,0.06)' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Database className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground">DynamoDB Ledger</h3>
              </div>
              <span className="text-[9px] font-black text-primary border border-primary/30 bg-primary/10 px-1.5 py-0.5 rounded tracking-widest">
                IMMUTABLE
              </span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2 rounded-lg bg-status-low/8 border border-status-low/20">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Integrity</div>
                  <div className="text-xl font-black text-status-low mono">{mockDatabaseLedgerHealth.integrity}%</div>
                  <div className="text-[9px] text-status-low font-semibold">✓ Verified</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Total Events</div>
                  <div className="text-xl font-black text-foreground mono">{(mockDatabaseLedgerHealth.totalEvents / 1e6).toFixed(1)}M</div>
                  <div className="text-[9px] text-muted-foreground">in ledger</div>
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Last Commit</div>
                  <div className="text-sm font-bold text-foreground mono">{mockDatabaseLedgerHealth.lastCommit}</div>
                </div>
                <div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Mode</div>
                  <div className="text-xs font-bold text-primary">{mockDatabaseLedgerHealth.immutability}</div>
                </div>
              </div>
              <div className="border-t border-primary/12 pt-3">
                <div className="text-[9px] text-primary/70 uppercase tracking-widest font-bold mb-2">Recent Checkpoints</div>
                {mockDatabaseLedgerHealth.recentCheckpoints.slice(0, 3).map((cp) => (
                  <div key={cp.timestamp} className="flex items-center justify-between text-[10px] py-0.5">
                    <span className="text-status-low mono">{cp.timestamp}</span>
                    <span className="text-muted-foreground mono">{cp.blockId}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Health + Replay Queue */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border glass-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="live-dot" />
                  <h3 className="text-sm font-bold text-foreground">System Health</h3>
                </div>
                <span className="text-[10px] font-bold text-status-healthy">ALL HEALTHY</span>
              </div>
              <div className="p-4 space-y-2.5">
                {mockSystemHealth.services.slice(0, 3).map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-1.5 h-1.5 rounded-full', s.status === 'Healthy' ? 'bg-status-healthy' : 'bg-destructive')} />
                      <span className="text-muted-foreground">{s.name}</span>
                    </div>
                    <span className={cn('font-semibold text-[11px]', s.status === 'Healthy' ? 'text-status-healthy' : 'text-destructive')}>{s.status}</span>
                  </div>
                ))}
                <div className="border-t border-border/40 pt-2 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Online</div>
                    <div className="text-sm font-black text-status-low mono">{mockSystemHealth.agentsOnline}/{mockSystemHealth.agentsTotal}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Uptime</div>
                    <div className="text-sm font-black text-status-low mono">{mockSystemHealth.systemUptime}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border glass-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Replay Queue</h3>
                </div>
                <span className="text-[10px] font-bold text-primary border border-primary/25 bg-primary/10 px-1.5 py-0.5 rounded mono">{mockReplayQueue.length} queued</span>
              </div>
              <div className="p-3 space-y-2">
                {mockReplayQueue.map((item) => (
                  <div key={item.runId} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-foreground truncate font-medium">{item.agentName}</div>
                      <div className="text-[10px] text-muted-foreground mono truncate">{item.runId}</div>
                    </div>
                    <StatusBadge status={item.status} className="shrink-0" />
                  </div>
                ))}
                <Button asChild variant="ghost" size="sm" className="w-full text-xs text-primary hover:bg-primary/10 mt-1 font-semibold">
                  <Link to="/run-replay">Go to Run Replay →</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
