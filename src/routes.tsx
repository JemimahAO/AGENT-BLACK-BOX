import type { ReactNode } from 'react';
import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CommandCenterPage = lazy(() => import('./pages/CommandCenterPage'));
const RunReplayPage = lazy(() => import('./pages/RunReplayPage'));
const ApprovalsPage = lazy(() => import('./pages/ApprovalsPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const DatabaseArchitecturePage = lazy(() => import('./pages/DatabaseArchitecturePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-muted-foreground font-mono">Loading AgentBlackbox...</span>
      </div>
    </div>
  );
}

function wrap(element: ReactNode) {
  return <Suspense fallback={<Loading />}>{element}</Suspense>;
}

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  { name: 'Landing', path: '/', element: wrap(<LandingPage />), public: true },
  { name: 'Login', path: '/login', element: wrap(<LoginPage />), public: true },
  { name: 'Register', path: '/register', element: wrap(<RegisterPage />), public: true },
  { name: 'Command Center', path: '/command-center', element: wrap(<CommandCenterPage />), public: true },
  { name: 'Run Replay', path: '/run-replay', element: wrap(<RunReplayPage />), public: true },
  { name: 'Approvals', path: '/approvals', element: wrap(<ApprovalsPage />), public: true },
  { name: 'Integrations', path: '/integrations', element: wrap(<IntegrationsPage />), public: true },
  { name: 'Reports', path: '/reports', element: wrap(<ReportsPage />), public: true },
  { name: 'Database Architecture', path: '/database-architecture', element: wrap(<DatabaseArchitecturePage />), public: true },
  { name: 'Settings', path: '/settings', element: wrap(<SettingsPage />), public: true },
  { name: 'Redirect', path: '*', element: <Navigate to="/" replace />, public: true },
];
