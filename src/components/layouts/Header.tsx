import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, HelpCircle, Search, Cpu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';

const PAGE_TITLES: Record<string, { title: string; subtitle: string; tag?: string }> = {
  '/command-center': {
    title: 'Command Center',
    subtitle: 'Real-time oversight of your AI agents, runs, and risk posture',
    tag: 'LIVE',
  },
  '/run-replay': {
    title: 'Run Replay',
    subtitle: 'Reconstruct and analyze agent runs step-by-step with full context and state.',
    tag: 'REC',
  },
  '/approvals': {
    title: 'Human Approvals',
    subtitle: 'Review and action high-risk agent requests requiring human intervention.',
  },
  '/integrations': {
    title: 'Integrations',
    subtitle: 'Connect existing AI agents and send structured events to AgentBlackbox.',
  },
  '/database-architecture': {
    title: 'Database Architecture',
    subtitle: 'AgentBlackbox uses a DynamoDB single-table event ledger for immutable, query-optimized auditability.',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Configure your AgentBlackbox deployment and connection settings.',
  },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageInfo = PAGE_TITLES[location.pathname] ?? { title: 'AgentBlackbox', subtitle: '' };

  return (
    <header className="h-14 flex items-center gap-3 px-4 border-b border-border shrink-0 relative"
      style={{ background: 'linear-gradient(180deg, hsl(222 26% 6%) 0%, hsl(222 24% 5%) 100%)' }}>
      {/* Subtle top amber accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Mobile menu */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
          <Sidebar onClose={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Page title */}
      <div className="flex-1 min-w-0 hidden md:flex items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-foreground leading-none">{pageInfo.title}</h1>
            {pageInfo.tag === 'LIVE' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-status-healthy/15 text-status-healthy border border-status-healthy/25 tracking-widest">
                <span className="w-1 h-1 rounded-full bg-status-healthy rec-blink" />
                LIVE
              </span>
            )}
            {pageInfo.tag === 'REC' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive/15 text-destructive border border-destructive/25 tracking-widest">
                <span className="w-1 h-1 rounded-full bg-destructive rec-blink" />
                REC
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{pageInfo.subtitle}</p>
        </div>
      </div>
      <div className="flex-1 min-w-0 md:hidden">
        <h1 className="text-sm font-semibold text-foreground truncate">{pageInfo.title}</h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => {}}
          className="hidden md:flex text-muted-foreground hover:bg-accent hover:text-foreground">
          <Search className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => {}}
          className="relative text-muted-foreground hover:bg-accent hover:text-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border border-background animate-pulse" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => {}}
          className="hidden md:flex text-muted-foreground hover:bg-accent hover:text-foreground">
          <HelpCircle className="w-4 h-4" />
        </Button>
        {/* AI status indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md bg-status-healthy/8 border border-status-healthy/20 ml-1">
          <Cpu className="w-3 h-3 text-status-healthy" />
          <span className="text-[10px] text-status-healthy font-semibold">12 Active</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] font-bold text-primary ml-1">
          AB
        </div>
      </div>
    </header>
  );
};
