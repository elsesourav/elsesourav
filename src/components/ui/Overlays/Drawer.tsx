import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type DrawerPlacement = 'left' | 'right' | 'bottom' | 'top';

export interface DrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly placement?: DrawerPlacement;
  readonly size?: 'sm' | 'md' | 'lg' | 'full';
  readonly position?: 'left' | 'right' | 'bottom' | 'top'; // alias for placement
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  placement,
  position = 'right',
  size = 'md',
}) => {
  const titleId = useId();
  const activePlacement = placement || position;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div className="ui-drawer-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'ui-drawer-panel',
          `ui-drawer-panel--${activePlacement}`,
          `ui-drawer-panel--${size}`
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-drawer__header">
          {title && (
            <h3 id={titleId} className="ui-drawer__title">
              {title}
            </h3>
          )}
          <button
            type="button"
            className="ui-drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="ui-drawer__body">{children}</div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
