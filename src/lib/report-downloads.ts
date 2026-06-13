import type { AuditReport } from '@/contexts/ReportsContext';

export const downloadReportJSON = (report: AuditReport) => {
  const dataStr = JSON.stringify(report, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.reportId}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadReportCSV = (report: AuditReport) => {
  const headers = ['Report ID', 'Run ID', 'Agent Name', 'Risk Level', 'Event Count', 'Policy Violations', 'Blocked Actions', 'Human Decisions', 'Generated At', 'Data Mode'];
  const values = [
    report.reportId,
    report.runId,
    report.agentName,
    report.riskLevel,
    report.eventCount,
    report.policyViolations,
    report.blockedActions,
    report.humanDecisions,
    report.generatedAt,
    report.dataMode,
  ];

  const csv = [headers.join(','), values.map(v => `"${v}"`).join(',')].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.reportId}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadReportMarkdown = (report: AuditReport) => {
  const markdown = `# Audit Report

## Report Metadata
- **Report ID**: ${report.reportId}
- **Run ID**: ${report.runId}
- **Generated**: ${new Date(report.generatedAt).toLocaleString()}
- **Data Source**: ${report.dataMode === 'live' ? 'Live DynamoDB Ledger' : 'Mock Fallback'}

## Agent Information
- **Agent Name**: ${report.agentName}
- **Risk Level**: ${report.riskLevel}

## Event Summary
- **Total Events**: ${report.eventCount}
- **Policy Violations**: ${report.policyViolations}
- **Blocked Actions**: ${report.blockedActions}
- **Human Decisions**: ${report.humanDecisions}

## Summary
${report.summary}

---
*This report is immutable and cryptographically verified by AgentBlackbox.*
`;

  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.reportId}.md`;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadReportHTML = (report: AuditReport) => {
  const riskColor = {
    LOW: '#00c853',
    MEDIUM: '#ffc400',
    HIGH: '#ff6d00',
    CRITICAL: '#d50000',
  }[report.riskLevel] || '#666';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Report - ${report.reportId}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f0f;
      color: #e0e0e0;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 40px;
    }
    header {
      border-bottom: 2px solid #ff8a00;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      margin: 0 0 10px 0;
      color: #ff8a00;
    }
    .subtitle {
      color: #888;
      font-size: 14px;
    }
    .section {
      margin: 30px 0;
    }
    .section h2 {
      color: #ff8a00;
      font-size: 18px;
      margin: 0 0 15px 0;
      border-left: 3px solid #ff8a00;
      padding-left: 10px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 15px 0;
    }
    .grid-item {
      background: rgba(255, 138, 0, 0.05);
      border: 1px solid rgba(255, 138, 0, 0.2);
      border-radius: 8px;
      padding: 15px;
    }
    .grid-item strong {
      color: #ff8a00;
      display: block;
      margin-bottom: 5px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .grid-item span {
      font-size: 24px;
      font-weight: bold;
    }
    .risk-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      background-color: ${riskColor}22;
      color: ${riskColor};
      border: 1px solid ${riskColor};
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .summary {
      background: rgba(255, 138, 0, 0.08);
      border-left: 4px solid #ff8a00;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #333;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Audit Report</h1>
      <p class="subtitle">AgentBlackbox Flight Recorder</p>
    </header>

    <div class="section">
      <h2>Report Information</h2>
      <div class="grid">
        <div class="grid-item">
          <strong>Report ID</strong>
          <span style="font-size: 14px; font-family: monospace;">${report.reportId}</span>
        </div>
        <div class="grid-item">
          <strong>Run ID</strong>
          <span style="font-size: 14px; font-family: monospace;">${report.runId}</span>
        </div>
        <div class="grid-item">
          <strong>Generated</strong>
          <span style="font-size: 14px;">${new Date(report.generatedAt).toLocaleString()}</span>
        </div>
        <div class="grid-item">
          <strong>Data Source</strong>
          <span style="font-size: 14px;">${report.dataMode === 'live' ? 'Live Ledger' : 'Mock Fallback'}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Agent & Risk Assessment</h2>
      <div class="grid">
        <div class="grid-item">
          <strong>Agent Name</strong>
          <span style="font-size: 16px;">${report.agentName}</span>
        </div>
        <div class="grid-item">
          <strong>Risk Level</strong>
          <div style="margin-top: 8px;"><span class="risk-badge">${report.riskLevel}</span></div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Event Summary</h2>
      <div class="grid">
        <div class="grid-item">
          <strong>Total Events</strong>
          <span>${report.eventCount}</span>
        </div>
        <div class="grid-item">
          <strong>Policy Violations</strong>
          <span>${report.policyViolations}</span>
        </div>
        <div class="grid-item">
          <strong>Blocked Actions</strong>
          <span>${report.blockedActions}</span>
        </div>
        <div class="grid-item">
          <strong>Human Decisions</strong>
          <span>${report.humanDecisions}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Summary</h2>
      <div class="summary">${report.summary}</div>
    </div>

    <div class="footer">
      <p>This audit report is immutable and cryptographically verified by AgentBlackbox.</p>
      <p>© 2026 AgentBlackbox. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.reportId}.html`;
  link.click();
  URL.revokeObjectURL(url);
};

export const openReportInNewTab = (report: AuditReport) => {
  const riskColor = {
    LOW: '#00c853',
    MEDIUM: '#ffc400',
    HIGH: '#ff6d00',
    CRITICAL: '#d50000',
  }[report.riskLevel] || '#666';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Report - ${report.reportId}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f0f0f;
      color: #e0e0e0;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 12px;
      padding: 40px;
    }
    header {
      border-bottom: 2px solid #ff8a00;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      margin: 0 0 10px 0;
      color: #ff8a00;
    }
    .subtitle {
      color: #888;
      font-size: 14px;
    }
    .section {
      margin: 30px 0;
    }
    .section h2 {
      color: #ff8a00;
      font-size: 18px;
      margin: 0 0 15px 0;
      border-left: 3px solid #ff8a00;
      padding-left: 10px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 15px 0;
    }
    .grid-item {
      background: rgba(255, 138, 0, 0.05);
      border: 1px solid rgba(255, 138, 0, 0.2);
      border-radius: 8px;
      padding: 15px;
    }
    .grid-item strong {
      color: #ff8a00;
      display: block;
      margin-bottom: 5px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .grid-item span {
      font-size: 24px;
      font-weight: bold;
    }
    .risk-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      background-color: ${riskColor}22;
      color: ${riskColor};
      border: 1px solid ${riskColor};
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .summary {
      background: rgba(255, 138, 0, 0.08);
      border-left: 4px solid #ff8a00;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #333;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Audit Report</h1>
      <p class="subtitle">AgentBlackbox Flight Recorder</p>
    </header>

    <div class="section">
      <h2>Report Information</h2>
      <div class="grid">
        <div class="grid-item">
          <strong>Report ID</strong>
          <span style="font-size: 14px; font-family: monospace;">${report.reportId}</span>
        </div>
        <div class="grid-item">
          <strong>Run ID</strong>
          <span style="font-size: 14px; font-family: monospace;">${report.runId}</span>
        </div>
        <div class="grid-item">
          <strong>Generated</strong>
          <span style="font-size: 14px;">${new Date(report.generatedAt).toLocaleString()}</span>
        </div>
        <div class="grid-item">
          <strong>Data Source</strong>
          <span style="font-size: 14px;">${report.dataMode === 'live' ? 'Live Ledger' : 'Mock Fallback'}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Agent & Risk Assessment</h2>
      <div class="grid">
        <div class="grid-item">
          <strong>Agent Name</strong>
          <span style="font-size: 16px;">${report.agentName}</span>
        </div>
        <div class="grid-item">
          <strong>Risk Level</strong>
          <div style="margin-top: 8px;"><span class="risk-badge">${report.riskLevel}</span></div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Event Summary</h2>
      <div class="grid">
        <div class="grid-item">
          <strong>Total Events</strong>
          <span>${report.eventCount}</span>
        </div>
        <div class="grid-item">
          <strong>Policy Violations</strong>
          <span>${report.policyViolations}</span>
        </div>
        <div class="grid-item">
          <strong>Blocked Actions</strong>
          <span>${report.blockedActions}</span>
        </div>
        <div class="grid-item">
          <strong>Human Decisions</strong>
          <span>${report.humanDecisions}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Summary</h2>
      <div class="summary">${report.summary}</div>
    </div>

    <div class="footer">
      <p>This audit report is immutable and cryptographically verified by AgentBlackbox.</p>
      <p>© 2026 AgentBlackbox. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Clean up after a delay to avoid issues
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
