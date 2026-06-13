import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuditReport {
  reportId: string;
  runId: string;
  agentName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  eventCount: number;
  policyViolations: number;
  blockedActions: number;
  humanDecisions: number;
  generatedAt: string;
  dataMode: 'live' | 'mock';
  summary: string;
  events: any[];
  isDemo?: boolean;
}

export interface ReportsContextType {
  reports: AuditReport[];
  addReport: (report: AuditReport) => void;
  deleteReport: (reportId: string) => void;
  getReport: (reportId: string) => AuditReport | undefined;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// Demo starter reports
const DEMO_REPORTS: AuditReport[] = [
  {
    reportId: 'report_demo_001',
    runId: 'run_dataexfil_critical',
    agentName: 'DataExfiltrationAgent',
    riskLevel: 'CRITICAL',
    eventCount: 12,
    policyViolations: 2,
    blockedActions: 1,
    humanDecisions: 1,
    generatedAt: new Date(Date.now() - 86400000).toISOString(),
    dataMode: 'mock',
    summary: 'Critical data exfiltration attempt detected and blocked. Agent attempted to export customer PII without approval.',
    events: [],
    isDemo: true,
  },
  {
    reportId: 'report_demo_002',
    runId: 'run_8f3a1a2b',
    agentName: 'RefundAgent',
    riskLevel: 'HIGH',
    eventCount: 10,
    policyViolations: 1,
    blockedActions: 1,
    humanDecisions: 1,
    generatedAt: new Date(Date.now() - 3600000).toISOString(),
    dataMode: 'mock',
    summary: 'High-value refund request ($4,800) exceeded policy threshold and was escalated to human approval.',
    events: [],
    isDemo: true,
  },
];

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<AuditReport[]>([]);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('agentblackbox_reports');
    if (stored) {
      try {
        const savedReports = JSON.parse(stored);
        setReports([...DEMO_REPORTS, ...savedReports]);
      } catch (e) {
        setReports(DEMO_REPORTS);
      }
    } else {
      setReports(DEMO_REPORTS);
    }
  }, []);

  const addReport = (report: AuditReport) => {
    const updated = [report, ...reports.filter(r => !r.isDemo)];
    setReports(updated);
    // Persist non-demo reports to localStorage
    const nonDemoReports = updated.filter(r => !r.isDemo);
    localStorage.setItem('agentblackbox_reports', JSON.stringify(nonDemoReports));
  };

  const deleteReport = (reportId: string) => {
    const updated = reports.filter(r => r.reportId !== reportId);
    setReports(updated);
    const nonDemoReports = updated.filter(r => !r.isDemo);
    localStorage.setItem('agentblackbox_reports', JSON.stringify(nonDemoReports));
  };

  const getReport = (reportId: string) => {
    return reports.find(r => r.reportId === reportId);
  };

  return (
    <ReportsContext.Provider value={{ reports, addReport, deleteReport, getReport }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within ReportsProvider');
  }
  return context;
};
