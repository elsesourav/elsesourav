import React, { useRef } from 'react';
import { cn } from '@/utils/cn';
import './Navigation.css';

export interface TabItem {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly badge?: React.ReactNode;
  readonly disabled?: boolean;
}

export interface TabsProps {
  readonly tabs: readonly TabItem[];
  readonly activeTab: string;
  readonly onChange: (tabId: string) => void;
  readonly variant?: 'pill' | 'underline' | 'glass';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
  readonly children?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  size = 'md',
  className,
  children,
}) => {
  const tabsListRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number): void => {
    const availableTabs = tabs.filter((t) => !t.disabled);
    const currentIndex = availableTabs.findIndex((t) => t.id === tabs[index]?.id);

    let nextTab: TabItem | undefined;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextTab = availableTabs[(currentIndex + 1) % availableTabs.length];
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextTab = availableTabs[(currentIndex - 1 + availableTabs.length) % availableTabs.length];
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextTab = availableTabs[0];
    } else if (e.key === 'End') {
      e.preventDefault();
      nextTab = availableTabs[availableTabs.length - 1];
    }

    if (nextTab) {
      onChange(nextTab.id);
      const nextButton = tabsListRef.current?.querySelector<HTMLButtonElement>(
        `[data-tab-id="${nextTab.id}"]`
      );
      nextButton?.focus();
    }
  };

  return (
    <div className={cn('ui-tabs-container', className)}>
      <div
        ref={tabsListRef}
        role="tablist"
        className={cn('ui-tabs-list', `ui-tabs-list--${variant}`, `ui-tabs-list--${size}`)}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              data-tab-id={tab.id}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              className={cn('ui-tab-btn', isActive && 'is-active', tab.disabled && 'is-disabled')}
              onClick={() => {
                if (!tab.disabled) onChange(tab.id);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {tab.icon && <span className="ui-tab__icon">{tab.icon}</span>}
              <span className="ui-tab__label">{tab.label}</span>
              {tab.badge && <span className="ui-tab__badge">{tab.badge}</span>}
            </button>
          );
        })}
      </div>

      {children && (
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="ui-tab-panel"
        >
          {children}
        </div>
      )}
    </div>
  );
};
