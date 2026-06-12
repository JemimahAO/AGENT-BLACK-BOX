import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Play,
  Database,
  Eye,
  GitBranch,
  Lock,
  Zap,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Box,
  Activity,
  Clock,
} from 'lucide-react';

const problems = [
  {
    title: 'Agents fail silently',
    description: 'When an autonomous agent makes a wrong decision, teams have no way to reconstruct which memory state, tool call, or policy check triggered the failure.',
  },
  {
    title: 'No audit trail',
    description: 'Compliance teams demand proof of what happened. Without an event ledger, teams cannot answer "what did the agent do and why?" under audit pressure.',
  },
  {
    title: 'Human oversight gaps',
    description: 'High-risk actions — large refunds, sensitive data access, medical record reads — happen without human-in-the-loop governance or approval queues.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Existing agents send events',
    description: 'Your already-built AI agents call the AgentBlackbox SDK to emit structured run events — no code rewrites needed.',
    icon: Zap,
    color: 'text-primary',
    border: 'border-primary/25',
    bg: 'bg-primary/8',
  },
  {
    step: '02',
    title: 'Event ledger stores everything',
    description: 'Every action, tool call, policy check, and approval decision is stored as an immutable event in the DynamoDB single-table ledger.',
    icon: Database,
    color: 'text-secondary',
    border: 'border-secondary/25',
    bg: 'bg-secondary/8',
  },
  {
    step: '03',
    title: 'Replay any run, instantly',
    description: 'Click Replay on any agent run to reconstruct the complete execution path, inspect memory states, and see exactly where it went wrong.',
    icon: Play,
    color: 'text-primary',
    border: 'border-primary/25',
    bg: 'bg-primary/8',
  },
  {
    step: '04',
    title: 'Govern high-risk actions',
    description: 'Policy violations trigger automatic blocking. Human approval queues route critical decisions to the right team before the action executes.',
    icon: Shield,
    color: 'text-destructive',
    border: 'border-destructive/25',
    bg: 'bg-destructive/8',
  },
];

const useCases = [
  { title: 'Fintech Refund Agents', description: 'Enforce refund limits, audit every transaction, and block unauthorized amounts in real time.', tag: 'FINTECH' },
  { title: 'Healthcare Admin Agents', description: 'Log every health record access under HIPAA-compliant event trails with human oversight.', tag: 'HEALTHCARE' },
  { title: 'Insurance Claim Agents', description: 'Replay claims decisions, detect policy violations, and maintain auditable approval histories.', tag: 'INSURANCE' },
  { title: 'SaaS Support Agents', description: 'Govern customer data access, track tool calls, and audit every support action taken.', tag: 'SAAS' },
  { title: 'Internal Automation Agents', description: 'Bring governance to internal workflow automation — log, replay, and audit every action.', tag: 'OPS' },
  { title: 'KYC & Fraud Agents', description: 'Track identity verification decisions, flag suspicious patterns, and maintain compliance records.', tag: 'KYC' },
];

const dbFeatures = [
  { icon: Lock, title: 'Immutable Event Ledger', description: 'DynamoDB writes are append-only. Once committed, no event can be modified or deleted.' },
  { icon: GitBranch, title: 'Single-Table Design', description: 'All event types share one table, enabling powerful cross-dimensional queries through GSIs.' },
  { icon: Eye, title: 'Query-Optimized Replay', description: 'Three GSIs enable instant access to events by agent, risk level, or approval status without scanning.' },
  { icon: Box, title: 'Multi-Tenant Partitioning', description: 'Partition key prefix TENANT# isolates data between tenants with zero cross-contamination.' },
];

// Mock product preview data for hero
const MOCK_EVENTS = [
  { time: '14:31:18', type: 'ACTION_ATTEMPTED', risk: 'CRITICAL', agent: 'RefundAgent' },
  { time: '14:31:19', type: 'POLICY_VIOLATION', risk: 'CRITICAL', agent: 'RefundAgent' },
  { time: '14:31:20', type: 'ACTION_BLOCKED', risk: 'CRITICAL', agent: 'RefundAgent' },
  { time: '14:31:22', type: 'APPROVAL_REQUESTED', risk: 'HIGH', agent: 'RefundAgent' },
  { time: '14:31:45', type: 'APPROVAL_DENIED', risk: 'HIGH', agent: 'Finance Team' },
];

const riskColor: Record<string, string> = {
  CRITICAL: 'text-status-critical',
  HIGH: 'text-status-high',
  MEDIUM: 'text-status-medium',
  LOW: 'text-status-low',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 backdrop-blur-xl"
        style={{ background: 'rgba(6,8,15,0.90)' }}>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/35 flex items-center justify-center glow-amber" style={{ background: 'linear-gradient(135deg, rgba(255,138,0,0.25) 0%, rgba(255,138,0,0.1) 100%)' }}>
              {/* Hexagon emblem */}
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M10 2 L16 6 L16 14 L10 18 L4 14 L4 6 Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
                <path d="M10 6 L14 9 L14 14 L10 17 L6 14 L6 9 Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive rec-blink border border-background" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-wide">AgentBlackbox</span>
            <span className="hidden md:inline text-[9px] font-bold text-primary/60 border border-primary/20 bg-primary/8 px-1.5 py-0.5 rounded tracking-widest">
              FLIGHT RECORDER
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground hidden md:inline-flex text-sm">
              <Link to="/database-architecture">Architecture</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              <Link to="/command-center">Open Command Center</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
        <div className="absolute inset-0 hero-glow-red" />
        {/* Radial amber pulse (top-center) */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(255,138,0,0.09) 0%, transparent 70%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-primary rec-blink" />
                H0 Hackathon · Track 2 — Monetizable B2B App
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] mb-6 text-balance">
                <span className="text-gradient-hero">Flight recorder</span>
                <br />
                <span className="text-foreground">for AI agents</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mb-8 text-pretty leading-relaxed">
                Replay, govern, and audit every AI agent action before it becomes a production incident. Built on Amazon DynamoDB — immutable by design.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 glow-amber-strong">
                  <Link to="/command-center">
                    <Play className="w-4 h-4 mr-2" />
                    Open Command Center
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-border hover:bg-accent">
                  <Link to="/run-replay">
                    <Eye className="w-4 h-4 mr-2" />
                    Replay Demo Incident
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {[
                  'Amazon DynamoDB event ledger',
                  'Immutable audit trails',
                  'Human-in-the-loop governance',
                  'One-click run replay',
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-status-low shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Product preview mock card */}
            <div className="relative lg:pl-4">
              {/* Ambient glow behind card */}
              <div className="absolute inset-0 bg-primary/6 blur-3xl rounded-full pointer-events-none" />
              <div className="relative glass-card rounded-xl overflow-hidden border-amber-glow">
                {/* Card titlebar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-primary/15"
                  style={{ background: 'rgba(255,138,0,0.06)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-status-medium/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-status-low/70" />
                    </div>
                    <span className="text-[10px] text-muted-foreground mono">AgentBlackbox · Incident Forensics</span>
                  </div>
                  <span className="text-[9px] font-bold text-destructive border border-destructive/30 bg-destructive/10 px-1.5 py-0.5 rounded tracking-wider flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-destructive rec-blink" />
                    CRITICAL
                  </span>
                </div>

                {/* Incident banner mini */}
                <div className="px-4 pt-4 pb-3">
                  <div className="rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5 mb-3 flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-destructive uppercase tracking-widest">Critical Incident</div>
                      <div className="text-xs font-semibold text-foreground truncate">Unauthorized $4,800 Refund Attempt</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground mono shrink-0">2m ago</div>
                  </div>

                  {/* Event timeline mini */}
                  <div className="space-y-0.5">
                    {MOCK_EVENTS.map((evt, i) => (
                      <div key={i} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] ${i === 2 ? 'bg-primary/12 border border-primary/20' : 'hover:bg-accent/30'}`}>
                        <span className="text-muted-foreground mono w-12 shrink-0">{evt.time}</span>
                        <span className={`flex-1 min-w-0 truncate mono ${i === 2 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{evt.type}</span>
                        <span className={`shrink-0 font-bold text-[10px] ${riskColor[evt.risk] ?? 'text-muted-foreground'}`}>{evt.risk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom stats bar */}
                <div className="flex items-center gap-4 px-4 py-3 border-t border-border/40"
                  style={{ background: 'rgba(0,0,0,0.25)' }}>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Activity className="w-3 h-3 text-status-info" />
                    <span className="text-muted-foreground">13 Events</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                    <span className="text-muted-foreground">2 Violations</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Clock className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">1 Approval</span>
                  </div>
                  <div className="flex-1" />
                  <span className="text-[10px] font-bold text-primary mono">run_8f3a1a2b</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────────── */}
      <section className="py-16 md:py-20 relative">
        <div className="section-divider mb-16 md:mb-20" />
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-destructive text-xs font-bold uppercase tracking-widest mb-4">
              <AlertTriangle className="w-4 h-4" />
              The Problem
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-balance mb-4">
              Autonomous agents fail autonomously
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
              When something goes wrong, teams have no way to reconstruct what happened — and no proof to show auditors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {problems.map((p) => (
              <div key={p.title}
                className="p-5 rounded-xl border border-destructive/18 glass-card-red h-full flex flex-col border-left-red">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-destructive rec-blink" />
                  <span className="text-[10px] font-bold text-destructive uppercase tracking-widest">ALERT</span>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2 text-balance">{p.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty flex-1 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section className="py-16 md:py-20 relative">
        <div className="section-divider mb-16 md:mb-20" />
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <Zap className="w-4 h-4" />
              How It Works
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-balance">
              Connect. Record. Replay.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-3 top-8 z-10 w-5 h-5 text-border" />
                )}
                <div className={`p-5 rounded-xl border ${s.border} glass-card h-full flex flex-col`}>
                  <div className={`text-3xl font-black mono mb-3 ${s.color} opacity-30`}>{s.step}</div>
                  <div className={`w-9 h-9 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center mb-3`}>
                    <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-2 text-balance">{s.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty flex-1 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUDIT TRAIL ────────────────────────────────── */}
      <section className="py-16 md:py-20 relative">
        <div className="section-divider mb-16 md:mb-20" />
        <div className="absolute inset-0 bg-accent/20 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
                <Shield className="w-4 h-4" />
                Why Audit Trails Matter
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-5 text-balance">
                Proof when it matters most
              </h2>
              <p className="text-muted-foreground mb-6 text-pretty leading-relaxed">
                Companies deploying autonomous agents face regulatory scrutiny, internal compliance requirements, and security incident response demands. Without a verified audit trail, you cannot prove what happened.
              </p>
              <ul className="space-y-3">
                {[
                  'SOC 2, HIPAA, and GDPR compliance audits',
                  'Post-incident forensic investigation',
                  'Agent behavior debugging and root cause analysis',
                  'Human-in-the-loop governance for high-risk actions',
                  'Board-level risk reporting for AI deployment',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-status-low shrink-0 mt-0.5" />
                    <span className="text-pretty">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40"
                style={{ background: 'rgba(255,138,0,0.05)' }}>
                <div className="live-dot" />
                <span className="text-[10px] font-bold text-muted-foreground mono uppercase tracking-widest">AUDIT TRAIL — LIVE</span>
              </div>
              <div className="p-4 space-y-1">
                {[
                  { time: '14:31:02', event: 'RUN_STARTED', risk: 'INFO', color: 'text-status-info' },
                  { time: '14:31:15', event: 'POLICY_CHECKED', risk: 'MEDIUM', color: 'text-status-medium' },
                  { time: '14:31:18', event: 'ACTION_ATTEMPTED', risk: 'CRITICAL', color: 'text-status-critical' },
                  { time: '14:31:19', event: 'POLICY_VIOLATION_DETECTED', risk: 'CRITICAL', color: 'text-status-critical' },
                  { time: '14:31:20', event: 'ACTION_BLOCKED', risk: 'CRITICAL', color: 'text-status-critical' },
                  { time: '14:31:22', event: 'HUMAN_APPROVAL_REQUESTED', risk: 'HIGH', color: 'text-status-high' },
                ].map((row) => (
                  <div key={row.time} className="flex items-center gap-3 text-[11px] mono py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground w-14 shrink-0">{row.time}</span>
                    <span className={`${row.color} flex-1 min-w-0 truncate`}>{row.event}</span>
                    <span className={`${row.color} shrink-0 font-bold text-[10px] px-1.5 py-0.5 rounded border ${row.risk === 'CRITICAL' ? 'border-status-critical/30 bg-status-critical/8' : row.risk === 'HIGH' ? 'border-status-high/30 bg-status-high/8' : 'border-border bg-muted/30'}`}>{row.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DATABASE ARCHITECTURE ──────────────────────── */}
      <section className="py-16 md:py-20 relative">
        <div className="section-divider mb-16 md:mb-20" />
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <Database className="w-4 h-4" />
              Database-First Architecture
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-balance">
              Built on Amazon DynamoDB
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
              A single-table event ledger with three Global Secondary Indexes enables every access pattern without a single full table scan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dbFeatures.map((f) => (
              <div key={f.title} className="p-5 rounded-xl border border-primary/15 glass-card h-full flex flex-col glow-amber">
                <div className="w-9 h-9 rounded-lg bg-primary/12 border border-primary/25 flex items-center justify-center mb-3">
                  <f.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2 text-balance">{f.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty flex-1 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-primary/22 bg-primary/5 glow-amber">
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm mono">
              <span className="text-muted-foreground">Table:</span>
              <span className="text-primary font-bold">AgentBlackboxEvents</span>
              <span className="text-border mx-1 hidden md:inline">·</span>
              <span className="text-muted-foreground">PK:</span>
              <span className="text-primary text-xs">TENANT#&lt;tenantId&gt;</span>
              <span className="text-border mx-1 hidden md:inline">·</span>
              <span className="text-muted-foreground">SK:</span>
              <span className="text-primary text-xs">RUN#&lt;runId&gt;#EVENT#&lt;ts&gt;#&lt;id&gt;</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── B2B USE CASES ──────────────────────────────── */}
      <section className="py-16 md:py-20 relative">
        <div className="section-divider mb-16 md:mb-20" />
        <div className="absolute inset-0 bg-accent/15 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-balance mb-4">B2B Use Cases</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-pretty">
              AgentBlackbox works wherever autonomous agents are deployed in production.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((u) => (
              <div key={u.title} className="p-5 rounded-xl border border-border glass-card h-full flex flex-col hover:border-primary/25 transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-bold text-secondary border border-secondary/25 bg-secondary/8 px-1.5 py-0.5 rounded tracking-widest">{u.tag}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2 text-balance">{u.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty flex-1 leading-relaxed">{u.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="py-20 md:py-28 relative">
        <div className="section-divider mb-20 md:mb-28" />
        {/* Dramatic glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,138,0,0.07) 0%, transparent 70%)' }} />
        <div className="relative max-w-3xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-balance">
            <span className="text-gradient-amber">The event ledger</span>
            <br />
            <span className="text-foreground">for AI agents.</span>
          </h2>
          <p className="text-muted-foreground mb-10 text-lg text-pretty leading-relaxed">
            Record, replay, and govern autonomous agent actions before they become production incidents. Connect any agent with the AgentBlackbox SDK and get immutable audit trails powered by Amazon DynamoDB.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-10 glow-amber-strong">
              <Link to="/command-center">
                <Play className="w-4 h-4 mr-2" />
                Open Command Center
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border hover:bg-accent">
              <Link to="/database-architecture">
                <Database className="w-4 h-4 mr-2" />
                View Architecture
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
