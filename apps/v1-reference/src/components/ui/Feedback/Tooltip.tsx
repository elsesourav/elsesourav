import React, { useState, useId } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  readonly content: React.ReactNode;
  readonly children: React.ReactElement<{
    'aria-describedby'?: string;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
  }>;
  readonly position?: 'top' | 'bottom' | 'left' | 'right';
  readonly delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const tooltipId = useId();

  const handleShow = (): void => {
    const id = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleHide = (): void => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  return (
    <div className="ui-tooltip-wrapper">
      {React.cloneElement(children, {
        'aria-describedby': isVisible ? tooltipId : undefined,
        onMouseEnter: handleShow,
        onMouseLeave: handleHide,
        onFocus: handleShow,
        onBlur: handleHide,
      })}
      {isVisible && (
        <div id={tooltipId} role="tooltip" className={cn('ui-tooltip', `ui-tooltip--${position}`)}>
          {content}
        </div>
      )}
    </div>
  );
};
