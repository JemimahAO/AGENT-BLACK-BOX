import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Play,
  CheckSquare,
  Plug,
  Database,
  Settings,
  FileText,
  Activity,
  RadioTower,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Command Center', path: '/command-center', icon: LayoutDashboard },
  { label: 'Run Replay', path: '/run-replay', icon: Play },
  { label: 'Approvals', path: '/approvals', icon: CheckSquare, badge: 12 },
  { label: 'Integrations', path: '/integrations', icon: Plug },
  { label: 'Reports', path: '/reports', icon: FileText },
  { label: 'Database Architecture', path: '/database-architecture', icon: Database },
  { label: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border relative overflow-hidden">
      {/* Subtle ambient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-primary/8 blur-3xl pointer-events-none rounded-full" />

      {/* Logo */}
      <div className="relative flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-primary/25 to-primary/10 border border-primary/35 flex items-center justify-center shrink-0 glow-amber">
          {/* Hexagon emblem SVG */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary w-4.5 h-4.5">
            <path d="M10 2 L16 6 L16 14 L10 18 L4 14 L4 6 Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.8"/>
            <path d="M10 6 L14 9 L14 14 L10 17 L6 14 L6 9 Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
          </svg>
          {/* REC indicator */}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-destructive rec-blink border-2 border-sidebar" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-foreground tracking-wide leading-none mb-0.5">AgentBlackbox</div>
          <div className="text-[9px] text-primary/70 font-medium tracking-widest uppercase">
            Flight Recorder
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-4 pb-2">
        <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest">Navigation</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon, badge }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 relative',
                isActive
                  ? 'bg-primary/12 text-primary border border-primary/22 glow-amber'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
              )}
              <Icon className={cn('w-4 h-4 shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground')} />
              <span className="flex-1 min-w-0 truncate">{label}</span>
              {badge && (
                <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center px-1">
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 mb-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            AC
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">Acme Corporation</div>
            <div className="text-[10px] text-muted-foreground">Enterprise Plan</div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-sidebar-accent/60">
          <div className="live-dot shrink-0" />
          <div className="text-[10px] text-muted-foreground flex-1 min-w-0 truncate">System Shield Active</div>
          <RadioTower className="w-3 h-3 text-status-healthy shrink-0" />
        </div>
      </div>
    </div>
  );
};
