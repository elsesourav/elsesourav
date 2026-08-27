import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingFallback } from '@/components/feedback/LoadingFallback';
import { ErrorState, Button } from '@/components';
import { ShieldAlert, Home } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export interface AdminRouteProps {
  readonly children?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingFallback message="Verifying administrator privileges..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
        }}
      >
        <ErrorState
          icon={<ShieldAlert size={32} />}
          title="Admin Access Required"
          description="This section is restricted to the platform administrator. You do not have sufficient permissions to view this portal."
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Home size={15} />}
              onClick={() => {
                window.location.href = ROUTES.HOME;
              }}
            >
              Return to Home
            </Button>
          }
        />
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
