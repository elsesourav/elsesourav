import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import './Feedback.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  readonly variant?: AlertVariant;
  readonly title?: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly onDismiss?: () => void;
}

const defaultIcons: Record<AlertVariant, React.ReactNode> = {
  info: <Info size={18} aria-hidden="true" />,
  success: <CheckCircle2 size={18} aria-hidden="true" />,
  warning: <AlertTriangle size={18} aria-hidden="true" />,
  error: <XCircle size={18} aria-hidden="true" />,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ children, className, variant = 'info', title, icon, onDismiss, ...props }, ref) => {
    const activeIcon = icon !== undefined ? icon : defaultIcons[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn('ui-alert', `ui-alert--${variant}`, className)}
        {...props}
      >
        {activeIcon && <div className="ui-alert__icon">{activeIcon}</div>}
        <div className="ui-alert__content">
          {title && <h4 className="ui-alert__title">{title}</h4>}
          <div className="ui-alert__message">{children}</div>
        </div>
        {onDismiss && (
          <button
            type="button"
            className="ui-alert__dismiss"
            onClick={onDismiss}
            aria-label="Dismiss alert"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
