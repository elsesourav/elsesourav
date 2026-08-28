import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface BreadcrumbItem {
  readonly label: React.ReactNode;
  readonly href?: string;
  readonly icon?: React.ReactNode;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  readonly items: readonly BreadcrumbItem[];
  readonly separator?: React.ReactNode;
  readonly onNavigate?: (href: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = (
    <ChevronRight size={14} className="ui-breadcrumb__separator-icon" aria-hidden="true" />
  ),
  onNavigate,
  className,
  ...props
}) => {
  return (
    <nav aria-label="Breadcrumbs" className={cn('ui-breadcrumb', className)} {...props}>
      <ol className="ui-breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="ui-breadcrumb__item">
              {isLast ? (
                <span className="ui-breadcrumb__current" aria-current="page">
                  {item.icon && <span className="ui-breadcrumb__icon">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="ui-breadcrumb__link"
                  onClick={(e) => {
                    if (onNavigate && item.href) {
                      e.preventDefault();
                      onNavigate(item.href);
                    }
                  }}
                >
                  {item.icon && <span className="ui-breadcrumb__icon">{item.icon}</span>}
                  <span>{item.label}</span>
                </a>
              ) : (
                <span className="ui-breadcrumb__text">
                  {item.icon && <span className="ui-breadcrumb__icon">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}

              {!isLast && <span className="ui-breadcrumb__separator">{separator}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
