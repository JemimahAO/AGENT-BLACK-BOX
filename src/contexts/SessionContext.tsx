import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  workspace: string;
  role: 'Admin' | 'Builder' | 'Viewer';
}

export interface SessionContextType {
  isLoggedIn: boolean;
  user: DemoUser | null;
  mode: 'live' | 'mock';
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (name: string, email: string, company: string, password: string) => Promise<{ error: Error | null }>;
  continueAsDemo: () => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [mode, setMode] = useState<'live' | 'mock'>('mock');

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('agentblackbox_demo_session');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        setUser(session.user);
        setMode(session.mode);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('agentblackbox_demo_session');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ error: Error | null }> => {
    // Demo auth - accepts any email/password combination
    const demoUser: DemoUser = {
      id: 'user_' + Date.now().toString(36),
      name: 'Jemimah Adwar',
      email,
      workspace: 'AgentBlackbox Demo',
      role: 'Admin',
    };

    const session = { user: demoUser, mode: 'mock' as const };
    localStorage.setItem('agentblackbox_demo_session', JSON.stringify(session));
    setUser(demoUser);
    setMode('mock');
    setIsLoggedIn(true);
    return { error: null };
  };

  const register = async (name: string, email: string, company: string, password: string): Promise<{ error: Error | null }> => {
    // Demo auth - creates a new demo account
    const demoUser: DemoUser = {
      id: 'user_' + Date.now().toString(36),
      name,
      email,
      workspace: company || 'Personal Workspace',
      role: 'Admin',
    };

    const session = { user: demoUser, mode: 'mock' as const };
    localStorage.setItem('agentblackbox_demo_session', JSON.stringify(session));
    setUser(demoUser);
    setMode('mock');
    setIsLoggedIn(true);
    return { error: null };
  };

  const continueAsDemo = () => {
    const demoUser: DemoUser = {
      id: 'user_demo_' + Date.now().toString(36),
      name: 'Jemimah Adwar',
      email: 'demo@agentblackbox.io',
      workspace: 'AgentBlackbox Demo',
      role: 'Builder',
    };

    const session = { user: demoUser, mode: 'mock' as const };
    localStorage.setItem('agentblackbox_demo_session', JSON.stringify(session));
    setUser(demoUser);
    setMode('mock');
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('agentblackbox_demo_session');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <SessionContext.Provider value={{ isLoggedIn, user, mode, login, register, continueAsDemo, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};
