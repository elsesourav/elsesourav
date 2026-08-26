import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import './Overlays.css';

export interface DialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly closeOnBackdropClick?: boolean;
  readonly closeOnEscape?: boolean;
  readonly showCloseButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      className="ui-dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && closeOnBackdropClick) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn('ui-dialog-panel', `ui-dialog-panel--${size}`)}
      >
        <div className="ui-dialog__header">
          <div>
            {title && (
              <h3 id={titleId} className="ui-dialog__title">
                {title}
              </h3>
            )}
            {description && (
              <p id={descriptionId} className="ui-dialog__description">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              className="ui-dialog__close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="ui-dialog__body">{children}</div>

        {footer && <div className="ui-dialog__footer">{footer}</div>}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
