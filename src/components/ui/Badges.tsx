import React from 'react';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/types';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showDots?: boolean;
}

const riskConfig: Record<RiskLevel, { label: string; dotColor: string; textColor: string; borderColor: string; bgColor: string; dots: number }> = {
  CRITICAL: {
    label: 'Critical',
    dotColor: 'bg-status-critical',
    textColor: 'text-status-critical',
    borderColor: 'border-status-critical/40',
    bgColor: 'bg-status-critical/10',
    dots: 5,
  },
  HIGH: {
    label: 'High',
    dotColor: 'bg-status-high',
    textColor: 'text-status-high',
    borderColor: 'border-status-high/40',
    bgColor: 'bg-status-high/10',
    dots: 4,
  },
  MEDIUM: {
    label: 'Medium',
    dotColor: 'bg-status-medium',
    textColor: 'text-status-medium',
    borderColor: 'border-status-medium/40',
    bgColor: 'bg-status-medium/10',
    dots: 3,
  },
  LOW: {
    label: 'Low',
    dotColor: 'bg-status-low',
    textColor: 'text-status-low',
    borderColor: 'border-status-low/40',
    bgColor: 'bg-status-low/10',
    dots: 2,
  },
  INFO: {
    label: 'Info',
    dotColor: 'bg-status-info',
    textColor: 'text-status-info',
    borderColor: 'border-status-info/40',
    bgColor: 'bg-status-info/10',
    dots: 1,
  },
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className, showDots = false }) => {
  const config = riskConfig[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {showDots ? (
        <span className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                i < config.dots ? config.dotColor : 'bg-muted'
              )}
            />
          ))}
        </span>
      ) : (
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      )}
      {config.label}
    </span>
  );
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const configs: Record<string, { textColor: string; borderColor: string; bgColor: string; dotColor: string }> = {
    COMPLETED: { textColor: 'text-status-low', borderColor: 'border-status-low/40', bgColor: 'bg-status-low/10', dotColor: 'bg-status-low' },
    FLAGGED: { textColor: 'text-status-high', borderColor: 'border-status-high/40', bgColor: 'bg-status-high/10', dotColor: 'bg-status-high' },
    BLOCKED: { textColor: 'text-status-critical', borderColor: 'border-status-critical/40', bgColor: 'bg-status-critical/10', dotColor: 'bg-status-critical' },
    PENDING_APPROVAL: { textColor: 'text-status-pending', borderColor: 'border-status-pending/40', bgColor: 'bg-status-pending/10', dotColor: 'bg-status-pending' },
    RUNNING: { textColor: 'text-status-info', borderColor: 'border-status-info/40', bgColor: 'bg-status-info/10', dotColor: 'bg-status-info' },
    PENDING: { textColor: 'text-status-pending', borderColor: 'border-status-pending/40', bgColor: 'bg-status-pending/10', dotColor: 'bg-status-pending' },
    APPROVED: { textColor: 'text-status-low', borderColor: 'border-status-low/40', bgColor: 'bg-status-low/10', dotColor: 'bg-status-low' },
    DENIED: { textColor: 'text-status-critical', borderColor: 'border-status-critical/40', bgColor: 'bg-status-critical/10', dotColor: 'bg-status-critical' },
    QUEUED: { textColor: 'text-status-info', borderColor: 'border-status-info/40', bgColor: 'bg-status-info/10', dotColor: 'bg-status-info' },
  };
  const config = configs[status] ?? { textColor: 'text-muted-foreground', borderColor: 'border-border', bgColor: 'bg-muted', dotColor: 'bg-muted-foreground' };
  const label = status.replace('_', ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border',
        config.bgColor, config.textColor, config.borderColor, className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      {label}
    </span>
  );
};

interface EventTypeBadgeProps {
  eventType: string;
  className?: string;
}

export const EventTypeBadge: React.FC<EventTypeBadgeProps> = ({ eventType, className }) => {
  const isViolation = eventType.includes('VIOLATION') || eventType.includes('BLOCKED');
  const isApproval = eventType.includes('APPROVAL') || eventType.includes('APPROVED') || eventType.includes('DENIED');
  const isCompleted = eventType.includes('COMPLETED') || eventType.includes('EXECUTED');

  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium border',
        isViolation && 'text-status-critical border-status-critical/30 bg-status-critical/10',
        isApproval && 'text-status-pending border-status-pending/30 bg-status-pending/10',
        isCompleted && 'text-status-low border-status-low/30 bg-status-low/10',
        !isViolation && !isApproval && !isCompleted && 'text-muted-foreground border-border bg-muted/50',
        className
      )}
    >
      {eventType}
    </span>
  );
};
