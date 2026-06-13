import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type DataMode = 'live' | 'mock';

export interface AppStatus {
  isDynamoConnected: boolean;
  dataMode: DataMode;
  lastSuccessfulConnectionCheck: Date | null;
  lastSuccessfulWrite: Date | null;
  lastSeededRunId: string | null;
  liveEventsCount: number;
  pendingApprovalsCount: number;
  latestApiStatus: string | null;
  latestRunId: string | null;
  tableName?: string;
  region?: string;
  isBootstrapped: boolean;
}

interface AppStatusContextType {
  status: AppStatus;
  updateConnectionStatus: (connected: boolean, mode: DataMode, tableName?: string, region?: string) => void;
  recordSuccessfulWrite: (runId: string, eventsCount: number) => void;
  recordConnectionCheck: () => void;
  setPendingApprovalsCount: (count: number) => void;
  setLatestRunId: (runId: string) => void;
  setLatestApiStatus: (status: string) => void;
  reset: () => void;
  performHealthCheck: () => Promise<void>;
}

const defaultStatus: AppStatus = {
  isDynamoConnected: false,
  dataMode: 'mock',
  lastSuccessfulConnectionCheck: null,
  lastSuccessfulWrite: null,
  lastSeededRunId: null,
  liveEventsCount: 0,
  pendingApprovalsCount: 0,
  latestApiStatus: null,
  latestRunId: null,
  tableName: undefined,
  region: undefined,
  isBootstrapped: false,
};

const AppStatusContext = createContext<AppStatusContextType | undefined>(undefined);

export function AppStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AppStatus>(() => {
    // Try to restore from localStorage on mount
    try {
      const cached = localStorage.getItem('agentblackbox_ledger_status');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...defaultStatus,
          ...parsed,
          lastSuccessfulConnectionCheck: parsed.lastSuccessfulConnectionCheck ? new Date(parsed.lastSuccessfulConnectionCheck) : null,
          lastSuccessfulWrite: parsed.lastSuccessfulWrite ? new Date(parsed.lastSuccessfulWrite) : null,
        };
      }
    } catch (e) {
      console.log('[v0] Failed to restore cached ledger status');
    }
    return defaultStatus;
  });

  // Save status to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('agentblackbox_ledger_status', JSON.stringify({
        isDynamoConnected: status.isDynamoConnected,
        dataMode: status.dataMode,
        lastSuccessfulConnectionCheck: status.lastSuccessfulConnectionCheck?.toISOString() ?? null,
        lastSuccessfulWrite: status.lastSuccessfulWrite?.toISOString() ?? null,
        lastSeededRunId: status.lastSeededRunId,
        tableName: status.tableName,
        region: status.region,
      }));
    } catch (e) {
      console.log('[v0] Failed to save ledger status to localStorage');
    }
  }, [status]);

  const performHealthCheck = useCallback(async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (data.ok) {
        setStatus((prev) => ({
          ...prev,
          isDynamoConnected: true,
          dataMode: 'live',
          lastSuccessfulConnectionCheck: new Date(),
          tableName: data.table,
          region: data.region,
          isBootstrapped: true,
        }));
      } else {
        setStatus((prev) => ({
          ...prev,
          isDynamoConnected: false,
          dataMode: 'mock',
          isBootstrapped: true,
        }));
      }
    } catch (error) {
      console.log('[v0] Health check failed:', error);
      setStatus((prev) => ({
        ...prev,
        isDynamoConnected: false,
        dataMode: 'mock',
        isBootstrapped: true,
      }));
    }
  }, []);

  // Perform health check on mount
  useEffect(() => {
    performHealthCheck();
  }, [performHealthCheck]);

  const updateConnectionStatus = useCallback((connected: boolean, mode: DataMode, tableName?: string, region?: string) => {
    setStatus((prev) => ({
      ...prev,
      isDynamoConnected: connected,
      dataMode: mode,
      lastSuccessfulConnectionCheck: connected ? new Date() : prev.lastSuccessfulConnectionCheck,
      tableName: tableName ?? prev.tableName,
      region: region ?? prev.region,
    }));
  }, []);

  const recordSuccessfulWrite = useCallback((runId: string, eventsCount: number) => {
    setStatus((prev) => ({
      ...prev,
      lastSuccessfulWrite: new Date(),
      lastSeededRunId: runId,
      liveEventsCount: Math.max(prev.liveEventsCount, eventsCount),
    }));
  }, []);

  const recordConnectionCheck = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      lastSuccessfulConnectionCheck: new Date(),
    }));
  }, []);

  const setPendingApprovalsCount = useCallback((count: number) => {
    setStatus((prev) => ({
      ...prev,
      pendingApprovalsCount: count,
    }));
  }, []);

  const setLatestRunId = useCallback((runId: string) => {
    setStatus((prev) => ({
      ...prev,
      latestRunId: runId,
    }));
  }, []);

  const setLatestApiStatus = useCallback((apiStatus: string) => {
    setStatus((prev) => ({
      ...prev,
      latestApiStatus: apiStatus,
    }));
  }, []);

  const reset = useCallback(() => {
    setStatus(defaultStatus);
    localStorage.removeItem('agentblackbox_ledger_status');
  }, []);

  return (
    <AppStatusContext.Provider
      value={{
        status,
        updateConnectionStatus,
        recordSuccessfulWrite,
        recordConnectionCheck,
        setPendingApprovalsCount,
        setLatestRunId,
        setLatestApiStatus,
        reset,
        performHealthCheck,
      }}
    >
      {children}
    </AppStatusContext.Provider>
  );
}

export function useAppStatus() {
  const context = useContext(AppStatusContext);
  if (!context) {
    throw new Error('useAppStatus must be used within AppStatusProvider');
  }
  return context;
}
