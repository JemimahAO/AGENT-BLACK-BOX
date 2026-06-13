import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { AppStatusProvider } from '@/contexts/AppStatusContext';
import { SessionProvider } from '@/contexts/SessionContext';
import { ReportsProvider } from '@/contexts/ReportsContext';

import { routes } from './routes';

const App: React.FC = () => {
  return (
    <SessionProvider>
      <AppStatusProvider>
        <ReportsProvider>
          <Router>
            <IntersectObserver />
            <Routes>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
            </Routes>
            <Toaster theme="dark" position="top-right" />
          </Router>
        </ReportsProvider>
      </AppStatusProvider>
    </SessionProvider>
  );
};

export default App;

