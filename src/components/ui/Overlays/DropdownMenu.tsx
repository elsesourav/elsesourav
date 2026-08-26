import React, { useState, useRef, useEffect, useId } from 'react';
import { cn } from '@/utils/cn';

export interface DropdownMenuItem {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly disabled?: boolean;
  readonly destructive?: boolean;
  readonly onClick?: () => void;
}

export interface DropdownMenuProps {
  readonly trigger: React.ReactElement<{
    onClick?: (e: React.MouseEvent) => void;
    'aria-haspopup'?: boolean;
    'aria-expanded'?: boolean;
  }>;
  readonly items: readonly (DropdownMenuItem | 'divider')[];
  readonly align?: 'start' | 'end';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items, align = 'end' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  const handleToggle = (e: React.MouseEvent): void => {
    trigger.props.onClick?.(e);
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={menuRef} className="ui-dropdown-wrapper">
      {React.cloneElement(trigger, {
        onClick: handleToggle,
        'aria-haspopup': true,
        'aria-expanded': isOpen,
      })}

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className={cn('ui-dropdown-menu', `ui-dropdown-menu--${align}`)}
        >
          {items.map((item, index) => {
            if (item === 'divider') {
              return (
                <div key={`divider-${index}`} className="ui-dropdown__divider" role="separator" />
              );
            }

            return (
              <button
                key={item.id}
                role="menuitem"
                type="button"
                disabled={item.disabled}
                className={cn(
                  'ui-dropdown__item',
                  item.destructive && 'is-destructive',
                  item.disabled && 'is-disabled'
                )}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setIsOpen(false);
                  }
                }}
              >
                {item.icon && <span className="ui-dropdown__item-icon">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
