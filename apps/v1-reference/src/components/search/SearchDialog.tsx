import React, { useState, useEffect, useCallback, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, AppWindow, Folder, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import { Modal, Input, Badge, Text } from '@/components';
import { ROUTES } from '@/constants/routes';

export interface SearchDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface QuickResult {
  readonly title: string;
  readonly type: 'app' | 'category' | 'blog' | 'help';
  readonly path: string;
}

const DEFAULT_SUGGESTIONS: readonly QuickResult[] = [
  { title: 'Explore Web Apps', type: 'app', path: ROUTES.APPS },
  { title: 'Browser Extensions', type: 'category', path: '/categories/extensions' },
  { title: 'Developer Tools', type: 'category', path: '/categories/developer-tools' },
  { title: 'Latest Devlog & Articles', type: 'blog', path: ROUTES.BLOG },
  { title: 'Help & FAQs', type: 'help', path: ROUTES.HELP },
  { title: 'Submit Support Ticket', type: 'help', path: ROUTES.SUPPORT },
];

export const SearchDialog: React.FC<SearchDialogProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const navigate = useNavigate();
  const searchInputId = useId();
  const listboxId = useId();

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  // Listen for Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = useCallback(
    (path: string) => {
      onClose();
      setQuery('');
      setSelectedIndex(-1);
      navigate(path);
    },
    [navigate, onClose]
  );

  const filtered = query.trim()
    ? DEFAULT_SUGGESTIONS.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : DEFAULT_SUGGESTIONS;

  const getTypeIcon = (type: QuickResult['type']) => {
    switch (type) {
      case 'app':
        return <AppWindow size={15} />;
      case 'category':
        return <Folder size={15} />;
      case 'blog':
        return <BookOpen size={15} />;
      case 'help':
        return <HelpCircle size={15} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Search ElseSourav">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Input
          id={searchInputId}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={true}
          aria-controls={listboxId}
          aria-activedescendant={
            selectedIndex >= 0 && filtered[selectedIndex]
              ? `search-opt-${selectedIndex}`
              : undefined
          }
          placeholder="Search apps, tools, categories, articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (selectedIndex >= 0 && filtered[selectedIndex]) {
                handleSelect(filtered[selectedIndex].path);
              } else if (query.trim()) {
                handleSelect(`/search?q=${encodeURIComponent(query.trim())}`);
              }
            }
          }}
          leftIcon={<Search size={16} />}
          rightIcon={
            query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : undefined
          }
          autoFocus
        />

        <div
          id={listboxId}
          role="listbox"
          aria-label="Search suggestions"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}
        >
          <Text variant="muted" size="xs" weight="medium">
            {query.trim() ? 'Quick Suggestions' : 'Quick Navigation'}
          </Text>

          {filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
              <Text variant="muted" size="sm">
                No results found for &ldquo;{query}&rdquo;
              </Text>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={item.path}
                  id={`search-opt-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => handleSelect(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected
                      ? 'var(--color-bg-tertiary, rgba(255, 255, 255, 0.08))'
                      : 'transparent',
                    border: 'none',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color var(--motion-fast) ease',
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}>
                      {getTypeIcon(item.type)}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-sm)' }}>{item.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Badge variant="mono" size="sm">
                      {item.type}
                    </Badge>
                    <ArrowRight size={12} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </button>
              );
            })
          )}

          {query.trim() && (
            <button
              type="button"
              onClick={() => handleSelect(`/search?q=${encodeURIComponent(query.trim())}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                color: 'var(--color-brand-primary, #6366f1)',
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: 'var(--space-2)',
                fontWeight: 'var(--font-weight-medium)',
                fontSize: 'var(--font-size-xs)',
              }}
            >
              <span>Search everything for &ldquo;{query.trim()}&rdquo;</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 'var(--space-2)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <Text variant="muted" size="xs">
            Press <kbd style={{ fontFamily: 'var(--font-family-mono)' }}>Esc</kbd> to close
          </Text>
          <Text variant="muted" size="xs">
            Shortcut <kbd style={{ fontFamily: 'var(--font-family-mono)' }}>⌘K</kbd>
          </Text>
        </div>
      </div>
    </Modal>
  );
};
