import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { AppStatusProvider } from '@/contexts/AppStatusContext';

import { routes } from './routes';

const App: React.FC = () => {
  return (
    <AppStatusProvider>
      <Router>
        <IntersectObserver />
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
        <Toaster theme="dark" position="top-right" />
      </Router>
    </AppStatusProvider>
  );
};

export default App;

