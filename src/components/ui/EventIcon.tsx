import React from 'react';
import { cn } from '@/lib/utils';
import type { RiskLevel, EventType } from '@/lib/types';
import {
  Play,
  MessageSquare,
  Brain,
  User,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  ShieldX,
  XCircle,
  Clock,
  CheckCircle,
  XOctagon,
  FileText,
  CheckSquare,
} from 'lucide-react';

interface EventIconProps {
  eventType: EventType;
  riskLevel?: RiskLevel;
  size?: 'sm' | 'md';
  className?: string;
}

const EVENT_CONFIG: Record<EventType, { icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
  RUN_STARTED: { icon: Play, color: 'text-status-info', bgColor: 'bg-status-info/20', borderColor: 'border-status-info/30' },
  USER_REQUEST_RECEIVED: { icon: MessageSquare, color: 'text-status-info', bgColor: 'bg-status-info/20', borderColor: 'border-status-info/30' },
  MEMORY_READ: { icon: Brain, color: 'text-muted-foreground', bgColor: 'bg-muted', borderColor: 'border-border' },
  CUSTOMER_PROFILE_READ: { icon: User, color: 'text-muted-foreground', bgColor: 'bg-muted', borderColor: 'border-border' },
  TOOL_CALLED: { icon: Wrench, color: 'text-status-info', bgColor: 'bg-status-info/15', borderColor: 'border-status-info/25' },
  POLICY_CHECKED: { icon: ShieldCheck, color: 'text-status-medium', bgColor: 'bg-status-medium/15', borderColor: 'border-status-medium/25' },
  ACTION_ATTEMPTED: { icon: AlertTriangle, color: 'text-status-critical', bgColor: 'bg-status-critical/20', borderColor: 'border-status-critical/40' },
  POLICY_VIOLATION_DETECTED: { icon: ShieldX, color: 'text-status-critical', bgColor: 'bg-status-critical/20', borderColor: 'border-status-critical/40' },
  ACTION_BLOCKED: { icon: XCircle, color: 'text-status-critical', bgColor: 'bg-status-critical/20', borderColor: 'border-status-critical/40' },
  HUMAN_APPROVAL_REQUESTED: { icon: Clock, color: 'text-status-pending', bgColor: 'bg-status-pending/15', borderColor: 'border-status-pending/30' },
  HUMAN_APPROVED: { icon: CheckCircle, color: 'text-status-low', bgColor: 'bg-status-low/15', borderColor: 'border-status-low/30' },
  HUMAN_DENIED: { icon: XOctagon, color: 'text-status-critical', bgColor: 'bg-status-critical/20', borderColor: 'border-status-critical/40' },
  ACTION_CANCELLED: { icon: XCircle, color: 'text-status-high', bgColor: 'bg-status-high/15', borderColor: 'border-status-high/25' },
  ACTION_EXECUTED: { icon: CheckCircle, color: 'text-status-low', bgColor: 'bg-status-low/15', borderColor: 'border-status-low/30' },
  MEMORY_UPDATED: { icon: Brain, color: 'text-status-info', bgColor: 'bg-status-info/15', borderColor: 'border-status-info/25' },
  AUDIT_REPORT_GENERATED: { icon: FileText, color: 'text-primary', bgColor: 'bg-primary/15', borderColor: 'border-primary/30' },
  RUN_COMPLETED: { icon: CheckSquare, color: 'text-status-low', bgColor: 'bg-status-low/15', borderColor: 'border-status-low/30' },
};

export const EventIcon: React.FC<EventIconProps> = ({ eventType, size = 'md', className }) => {
  const config = EVENT_CONFIG[eventType] ?? EVENT_CONFIG.RUN_STARTED;
  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className={cn(
      'rounded-full border flex items-center justify-center shrink-0',
      config.bgColor,
      config.borderColor,
      sizeClass,
      className,
    )}>
      <Icon className={cn(config.color, iconSize)} />
    </div>
  );
};
