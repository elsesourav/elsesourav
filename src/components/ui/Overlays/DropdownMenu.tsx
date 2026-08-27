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
    'aria-haspopup'?: boolean | 'menu' | 'dialog' | 'grid' | 'listbox' | 'tree';
    'aria-expanded'?: boolean;
    'aria-controls'?: string;
    ref?: React.Ref<HTMLElement>;
  }>;
  readonly items: readonly (DropdownMenuItem | 'divider')[];
  readonly align?: 'start' | 'end';
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, items, align = 'end' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      // Keyboard navigation between menu items
      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) && menuRef.current) {
        e.preventDefault();
        const menuButtons = Array.from(
          menuRef.current.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not([disabled])')
        );

        if (menuButtons.length === 0) return;

        const currentIndex = menuButtons.findIndex((btn) => btn === document.activeElement);

        if (e.key === 'ArrowDown') {
          const nextIndex = currentIndex === -1 || currentIndex === menuButtons.length - 1 ? 0 : currentIndex + 1;
          menuButtons[nextIndex]?.focus();
        } else if (e.key === 'ArrowUp') {
          const prevIndex = currentIndex <= 0 ? menuButtons.length - 1 : currentIndex - 1;
          menuButtons[prevIndex]?.focus();
        } else if (e.key === 'Home') {
          menuButtons[0]?.focus();
        } else if (e.key === 'End') {
          menuButtons[menuButtons.length - 1]?.focus();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // Focus first active menu item upon opening
    const focusTimer = window.setTimeout(() => {
      if (menuRef.current) {
        const firstItem = menuRef.current.querySelector<HTMLButtonElement>(
          'button[role="menuitem"]:not([disabled])'
        );
        firstItem?.focus();
      }
    }, 50);

    return () => {
      window.clearTimeout(focusTimer);
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
        ref: triggerRef,
        onClick: handleToggle,
        'aria-haspopup': 'menu',
        'aria-expanded': isOpen,
        'aria-controls': isOpen ? menuId : undefined,
      })}

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          tabIndex={-1}
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
                tabIndex={-1}
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
                    triggerRef.current?.focus();
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
