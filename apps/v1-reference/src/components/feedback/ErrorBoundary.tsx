import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, Heading, Text, Button, ErrorState } from '@/components';
import { ShieldAlert, AlertTriangle, AlertCircle, RotateCcw, Home } from 'lucide-react';
import { errorLogger } from '@/services/error-logger.service';
import './ErrorBoundary.css';

export interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
  readonly onReset?: () => void;
  readonly level?: 'root' | 'route' | 'feature';
  readonly title?: string;
  readonly description?: string;
  readonly showHomeAction?: boolean;
  readonly showRetryAction?: boolean;
}

export interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Structured error reporting with stack and level context
    errorLogger.logError(
      error,
      {
        level: this.props.level || 'root',
        title: this.props.title,
      },
      {
        category: 'UI_RENDER',
        isFatal: this.props.level === 'root',
        componentStack: errorInfo.componentStack || undefined,
      }
    );

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public handleGoHome = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public override render(): ReactNode {
    const {
      children,
      fallback,
      level = 'root',
      title,
      description,
      showHomeAction = true,
      showRetryAction = true,
    } = this.props;

    if (this.state.hasError && this.state.error) {
      if (typeof fallback === 'function') {
        return fallback(this.state.error, this.handleReset);
      }

      if (fallback) {
        return fallback;
      }

      // Feature-level compact inline boundary
      if (level === 'feature') {
        return (
          <div className="ui-error-boundary ui-error-boundary--feature" role="alert">
            <div className="ui-error-boundary__feature-box">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{title || 'This component could not be loaded.'}</span>
              {showRetryAction && (
                <Button variant="ghost" size="sm" onClick={this.handleReset}>
                  Retry
                </Button>
              )}
            </div>
          </div>
        );
      }

      // Route-level contained boundary (renders inside AppLayout/AdminLayout without breaking nav/shell)
      if (level === 'route') {
        return (
          <div className="ui-error-boundary ui-error-boundary--route" role="alert">
            <ErrorState
              icon={<AlertTriangle size={36} aria-hidden="true" />}
              title={title || 'Section Unavailable'}
              description={
                description ||
                "We encountered an issue loading this section. Please try again or return to the main directory."
              }
              onRetry={showRetryAction ? this.handleReset : undefined}
              retryLabel="Try Again"
              action={
                showHomeAction ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Home size={14} />}
                    onClick={this.handleGoHome}
                  >
                    Back to Home
                  </Button>
                ) : undefined
              }
            />
          </div>
        );
      }

      // Root-level full application recovery view
      return (
        <div className="ui-error-boundary ui-error-boundary--root" role="alert">
          <Card variant="glass" padding="lg" className="ui-error-boundary__card">
            <div className="ui-error-boundary__icon-wrapper">
              <ShieldAlert size={32} aria-hidden="true" />
            </div>

            <Heading level={1} size="xl" className="ui-error-boundary__title">
              {title || 'Something went wrong'}
            </Heading>

            <Text variant="muted" size="md" className="ui-error-boundary__desc">
              {description ||
                'An unexpected error occurred. You can reload this view or return to the homepage.'}
            </Text>

            <div className="ui-error-boundary__actions">
              {showRetryAction && (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<RotateCcw size={16} />}
                  onClick={this.handleReset}
                >
                  Try Again
                </Button>
              )}
              {showHomeAction && (
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Home size={16} />}
                  onClick={this.handleGoHome}
                >
                  Back to Home
                </Button>
              )}
            </div>

            {/* In Development Only: show technical diagnostic without exposing secrets */}
            {import.meta.env.DEV && (
              <details className="ui-error-boundary__debug">
                <summary>Diagnostic Details (Development Only)</summary>
                <pre>{this.state.error.message}</pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return children;
  }
}
