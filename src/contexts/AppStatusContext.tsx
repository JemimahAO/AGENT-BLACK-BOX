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
}

interface AppStatusContextType {
  status: AppStatus;
  updateConnectionStatus: (connected: boolean, mode: DataMode) => void;
  recordSuccessfulWrite: (runId: string, eventsCount: number) => void;
  recordConnectionCheck: () => void;
  setPendingApprovalsCount: (count: number) => void;
  setLatestRunId: (runId: string) => void;
  setLatestApiStatus: (status: string) => void;
  reset: () => void;
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
};

const AppStatusContext = createContext<AppStatusContextType | undefined>(undefined);

export function AppStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AppStatus>(defaultStatus);

  const updateConnectionStatus = useCallback((connected: boolean, mode: DataMode) => {
    setStatus((prev) => ({
      ...prev,
      isDynamoConnected: connected,
      dataMode: mode,
      lastSuccessfulConnectionCheck: connected ? new Date() : prev.lastSuccessfulConnectionCheck,
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
