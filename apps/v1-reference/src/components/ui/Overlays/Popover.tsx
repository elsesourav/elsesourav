import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

export interface PopoverProps {
  readonly trigger: React.ReactElement<{
    onClick?: (e: React.MouseEvent) => void;
    'aria-expanded'?: boolean;
  }>;
  readonly content: React.ReactNode;
  readonly align?: 'start' | 'center' | 'end';
}

export const Popover: React.FC<PopoverProps> = ({ trigger, content, align = 'center' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent): void => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={popoverRef} className="ui-popover-wrapper">
      {React.cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          trigger.props.onClick?.(e);
          setIsOpen((prev) => !prev);
        },
        'aria-expanded': isOpen,
      })}

      {isOpen && (
        <div className={cn('ui-popover-content', `ui-popover-content--${align}`)}>{content}</div>
      )}
    </div>
  );
};
