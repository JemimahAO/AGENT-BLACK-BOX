import React, { useState } from 'react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { RiskBadge, StatusBadge } from '@/components/ui/Badges';
import { useReports } from '@/contexts/ReportsContext';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  FileJson,
  FileText as FileTextIcon,
  FileCode,
  MoreVertical,
  ChevronRight,
} from 'lucide-react';
import {
  downloadReportJSON,
  downloadReportCSV,
  downloadReportMarkdown,
  downloadReportHTML,
  openReportInNewTab,
} from '@/lib/report-downloads';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { reports, deleteReport } = useReports();
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const handleDelete = (reportId: string) => {
    deleteReport(reportId);
    toast.info('Report deleted', { description: `${reportId} removed from archive.` });
  };

  const handleDownloadJSON = (reportId: string) => {
    const report = reports.find(r => r.reportId === reportId);
    if (report) {
      downloadReportJSON(report);
      toast.success('JSON downloaded', { description: `${reportId}.json` });
    }
  };

  const handleDownloadCSV = (reportId: string) => {
    const report = reports.find(r => r.reportId === reportId);
    if (report) {
      downloadReportCSV(report);
      toast.success('CSV downloaded', { description: `${reportId}.csv` });
    }
  };

  const handleDownloadMarkdown = (reportId: string) => {
    const report = reports.find(r => r.reportId === reportId);
    if (report) {
      downloadReportMarkdown(report);
      toast.success('Markdown downloaded', { description: `${reportId}.md` });
    }
  };

  const handleDownloadHTML = (reportId: string) => {
    const report = reports.find(r => r.reportId === reportId);
    if (report) {
      downloadReportHTML(report);
      toast.success('HTML downloaded', { description: `${reportId}.html` });
    }
  };

  const handleViewInBrowser = (reportId: string) => {
    const report = reports.find(r => r.reportId === reportId);
    if (report) {
      openReportInNewTab(report);
    }
  };

  const generatedReports = reports.filter(r => !r.isDemo);
  const demoReports = reports.filter(r => r.isDemo);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Audit Reports</h1>
          <p className="text-sm text-muted-foreground">
            Generated audit reports from agent runs. Download, view, and export in multiple formats.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Reports</div>
            <div className="text-2xl font-bold text-foreground">{reports.length}</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Generated</div>
            <div className="text-2xl font-bold text-foreground">{generatedReports.length}</div>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Demo Reports</div>
            <div className="text-2xl font-bold text-primary">{demoReports.length}</div>
          </div>
          <div className="rounded-lg border border-status-low/25 bg-status-low/4 p-3">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Critical</div>
            <div className="text-2xl font-bold text-destructive">{reports.filter(r => r.riskLevel === 'CRITICAL').length}</div>
          </div>
        </div>

        {/* Generated Reports Section */}
        {generatedReports.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide text-muted-foreground">
              Generated Reports
            </h2>
            <div className="space-y-2">
              {generatedReports.map((report) => (
                <ReportRow
                  key={report.reportId}
                  report={report}
                  isExpanded={expandedReportId === report.reportId}
                  onToggleExpand={() => setExpandedReportId(expandedReportId === report.reportId ? null : report.reportId)}
                  onDelete={() => handleDelete(report.reportId)}
                  onViewInBrowser={() => handleViewInBrowser(report.reportId)}
                  onDownloadJSON={() => handleDownloadJSON(report.reportId)}
                  onDownloadCSV={() => handleDownloadCSV(report.reportId)}
                  onDownloadMarkdown={() => handleDownloadMarkdown(report.reportId)}
                  onDownloadHTML={() => handleDownloadHTML(report.reportId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Demo Reports Section */}
        {demoReports.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide text-muted-foreground">
              Demo Starter Reports
            </h2>
            <div className="space-y-2">
              {demoReports.map((report) => (
                <ReportRow
                  key={report.reportId}
                  report={report}
                  isDemoReport
                  isExpanded={expandedReportId === report.reportId}
                  onToggleExpand={() => setExpandedReportId(expandedReportId === report.reportId ? null : report.reportId)}
                  onDelete={() => handleDelete(report.reportId)}
                  onViewInBrowser={() => handleViewInBrowser(report.reportId)}
                  onDownloadJSON={() => handleDownloadJSON(report.reportId)}
                  onDownloadCSV={() => handleDownloadCSV(report.reportId)}
                  onDownloadMarkdown={() => handleDownloadMarkdown(report.reportId)}
                  onDownloadHTML={() => handleDownloadHTML(report.reportId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {reports.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 p-12 flex flex-col items-center justify-center text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1">No reports yet</h3>
            <p className="text-xs text-muted-foreground max-w-xs mb-4">
              Generate an audit report from a run to see it here.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

interface ReportRowProps {
  report: any;
  isDemoReport?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onViewInBrowser: () => void;
  onDownloadJSON: () => void;
  onDownloadCSV: () => void;
  onDownloadMarkdown: () => void;
  onDownloadHTML: () => void;
}

function ReportRow({
  report,
  isDemoReport,
  isExpanded,
  onToggleExpand,
  onDelete,
  onViewInBrowser,
  onDownloadJSON,
  onDownloadCSV,
  onDownloadMarkdown,
  onDownloadHTML,
}: ReportRowProps) {
  const [showDownloads, setShowDownloads] = React.useState(false);

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 overflow-hidden hover:border-border/80 transition-colors">
      <div
        onClick={onToggleExpand}
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
      >
        <ChevronRight
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform shrink-0',
            isExpanded && 'rotate-90'
          )}
        />
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileTextIcon className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-xs font-mono text-foreground truncate">{report.reportId}</code>
              {isDemoReport && (
                <span className="text-[8px] font-black bg-primary/12 text-primary border border-primary/25 px-1.5 py-0.5 rounded tracking-wider">
                  DEMO
                </span>
              )}
              <RiskBadge level={report.riskLevel} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{report.summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 text-[11px] text-muted-foreground">
          <span className="hidden md:inline">{report.eventCount} events</span>
          <span className="mx-1 hidden md:inline">•</span>
          <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border/40 bg-muted/10 p-4 space-y-4">
          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Run ID</div>
              <code className="text-xs font-mono text-foreground">{report.runId}</code>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Agent</div>
              <div className="text-xs text-foreground">{report.agentName}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Events</div>
              <div className="text-xs text-foreground font-semibold">{report.eventCount}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Violations</div>
              <div className="text-xs text-destructive font-semibold">{report.policyViolations}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Blocked</div>
              <div className="text-xs text-destructive font-semibold">{report.blockedActions}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Approvals</div>
              <div className="text-xs text-foreground font-semibold">{report.humanDecisions}</div>
            </div>
          </div>

          {/* Data Mode Badge */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'text-[9px] font-black border px-2 py-0.5 rounded tracking-wider',
              report.dataMode === 'live'
                ? 'bg-status-low/10 text-status-low border-status-low/25'
                : 'bg-primary/10 text-primary border-primary/25'
            )}>
              {report.dataMode === 'live' ? 'LIVE LEDGER' : 'MOCK FALLBACK'}
            </div>
            <span className="text-[10px] text-muted-foreground">{new Date(report.generatedAt).toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
            <Button
              onClick={onViewInBrowser}
              size="sm"
              className="bg-primary/12 text-primary border border-primary/25 hover:bg-primary/20 text-xs h-7"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <div className="relative">
              <Button
                onClick={() => setShowDownloads(!showDownloads)}
                size="sm"
                className="bg-muted/40 border border-border/60 hover:bg-muted/60 text-xs h-7"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
              {showDownloads && (
                <div className="absolute top-full left-0 mt-1 bg-background border border-border/60 rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      onDownloadJSON();
                      setShowDownloads(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted/60 text-foreground flex items-center gap-2"
                  >
                    <FileJson className="w-3 h-3" />
                    JSON
                  </button>
                  <button
                    onClick={() => {
                      onDownloadCSV();
                      setShowDownloads(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted/60 text-foreground border-t border-border/40 flex items-center gap-2"
                  >
                    <FileTextIcon className="w-3 h-3" />
                    CSV
                  </button>
                  <button
                    onClick={() => {
                      onDownloadMarkdown();
                      setShowDownloads(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted/60 text-foreground border-t border-border/40 flex items-center gap-2"
                  >
                    <FileCode className="w-3 h-3" />
                    Markdown
                  </button>
                  <button
                    onClick={() => {
                      onDownloadHTML();
                      setShowDownloads(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted/60 text-foreground border-t border-border/40 flex items-center gap-2"
                  >
                    <FileTextIcon className="w-3 h-3" />
                    HTML
                  </button>
                </div>
              )}
            </div>
            <Button
              onClick={onDelete}
              size="sm"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 text-xs h-7"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
