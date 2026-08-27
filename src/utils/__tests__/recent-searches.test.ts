import { describe, it, expect, beforeEach } from 'vitest';
import {
  getRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from '@/utils/recent-searches';

describe('Local Recent Searches Manager (Prompt 52)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Returns empty list initially', () => {
    expect(getRecentSearches()).toEqual([]);
  });

  it('2. Saves search queries to local storage and prioritizes newest first', () => {
    saveRecentSearch('first query');
    saveRecentSearch('second query');

    const recents = getRecentSearches();
    expect(recents).toEqual(['second query', 'first query']);
  });

  it('3. Deduplicates identical queries case-insensitively', () => {
    saveRecentSearch('react tools');
    saveRecentSearch('REACT TOOLS');

    const recents = getRecentSearches();
    expect(recents).toEqual(['REACT TOOLS']);
  });

  it('4. Limits recent searches to maximum 5 items', () => {
    saveRecentSearch('q1');
    saveRecentSearch('q2');
    saveRecentSearch('q3');
    saveRecentSearch('q4');
    saveRecentSearch('q5');
    saveRecentSearch('q6');

    const recents = getRecentSearches();
    expect(recents.length).toBe(5);
    expect(recents[0]).toBe('q6');
    expect(recents).not.toContain('q1');
  });

  it('5. Removes individual recent searches cleanly', () => {
    saveRecentSearch('item-a');
    saveRecentSearch('item-b');

    const updated = removeRecentSearch('item-a');
    expect(updated).toEqual(['item-b']);
    expect(getRecentSearches()).toEqual(['item-b']);
  });

  it('6. Clears all recent searches', () => {
    saveRecentSearch('item-a');
    saveRecentSearch('item-b');

    clearRecentSearches();
    expect(getRecentSearches()).toEqual([]);
  });
});
