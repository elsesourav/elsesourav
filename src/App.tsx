import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/app/providers';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { AppRoutes } from '@/routes/AppRoutes';
import './App.css';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProviders>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
