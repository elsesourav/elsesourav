import { describe, it, expect } from 'vitest';
import {
  organizeScreenshotGrid,
  type GalleryMediaItem,
  type ScreenshotAspect,
} from '../../../../../apps/web/features/apps/components/media/screenshot-grid-layout';

describe('Screenshot Grid Layout & Promotion Algorithm', () => {
  it('returns empty rows for empty items', () => {
    const rows = organizeScreenshotGrid([], {});
    expect(rows).toEqual([]);
  });

  it('handles a single landscape item by spanning full width (col-12)', () => {
    const items: GalleryMediaItem[] = [
      { id: '1', type: 'image', url: 'https://cdn.com/1.png', originalIndex: 1 },
    ];
    const aspectMap: Record<string, ScreenshotAspect> = {
      'https://cdn.com/1.png': 'landscape',
    };

    const rows = organizeScreenshotGrid(items, aspectMap);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.cells).toHaveLength(1);
    expect(rows[0]!.cells[0]!.colSpan).toBe(12);
    expect(rows[0]!.cells[0]!.isCentered).toBeFalsy();
  });

  it('handles a single portrait item by centering it (col-6)', () => {
    const items: GalleryMediaItem[] = [
      { id: '1', type: 'image', url: 'https://cdn.com/1.png', originalIndex: 1 },
    ];
    const aspectMap: Record<string, ScreenshotAspect> = {
      'https://cdn.com/1.png': 'portrait',
    };

    const rows = organizeScreenshotGrid(items, aspectMap);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.cells).toHaveLength(1);
    expect(rows[0]!.cells[0]!.colSpan).toBe(6);
    expect(rows[0]!.cells[0]!.isCentered).toBe(true);
  });

  it('pairs Landscape + Portrait as col-8 + col-4', () => {
    const items: GalleryMediaItem[] = [
      { id: '1', type: 'image', url: 'https://cdn.com/l.png', originalIndex: 1 },
      { id: '2', type: 'image', url: 'https://cdn.com/p.png', originalIndex: 2 },
    ];
    const aspectMap: Record<string, ScreenshotAspect> = {
      'https://cdn.com/l.png': 'landscape',
      'https://cdn.com/p.png': 'portrait',
    };

    const rows = organizeScreenshotGrid(items, aspectMap);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.cells).toHaveLength(2);
    expect(rows[0]!.cells[0]!.colSpan).toBe(8);
    expect(rows[0]!.cells[1]!.colSpan).toBe(4);
  });

  it('pairs Portrait + Landscape as col-4 + col-8', () => {
    const items: GalleryMediaItem[] = [
      { id: '1', type: 'image', url: 'https://cdn.com/p.png', originalIndex: 1 },
      { id: '2', type: 'image', url: 'https://cdn.com/l.png', originalIndex: 2 },
    ];
    const aspectMap: Record<string, ScreenshotAspect> = {
      'https://cdn.com/p.png': 'portrait',
      'https://cdn.com/l.png': 'landscape',
    };

    const rows = organizeScreenshotGrid(items, aspectMap);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.cells).toHaveLength(2);
    expect(rows[0]!.cells[0]!.colSpan).toBe(4);
    expect(rows[0]!.cells[1]!.colSpan).toBe(8);
  });

  it('promotes following portrait when two consecutive landscapes appear [L, L, P]', () => {
    const items: GalleryMediaItem[] = [
      { id: '1', type: 'image', url: 'https://cdn.com/l1.png', originalIndex: 1 },
      { id: '2', type: 'image', url: 'https://cdn.com/l2.png', originalIndex: 2 },
      { id: '3', type: 'image', url: 'https://cdn.com/p.png', originalIndex: 3 },
    ];
    const aspectMap: Record<string, ScreenshotAspect> = {
      'https://cdn.com/l1.png': 'landscape',
      'https://cdn.com/l2.png': 'landscape',
      'https://cdn.com/p.png': 'portrait',
    };

    const rows = organizeScreenshotGrid(items, aspectMap);
    expect(rows).toHaveLength(2);

    // Row 1: L1 (8) + P (4) -> P was promoted!
    expect(rows[0]!.cells).toHaveLength(2);
    expect(rows[0]!.cells[0]!.item.id).toBe('1');
    expect(rows[0]!.cells[0]!.colSpan).toBe(8);
    expect(rows[0]!.cells[1]!.item.id).toBe('3');
    expect(rows[0]!.cells[1]!.colSpan).toBe(4);

    // Row 2: L2 (12)
    expect(rows[1]!.cells).toHaveLength(1);
    expect(rows[1]!.cells[0]!.item.id).toBe('2');
    expect(rows[1]!.cells[0]!.colSpan).toBe(12);
  });

  it('stacks 3 consecutive portraits into a single row [P, P, P] (col-4 + col-4 + col-4)', () => {
    const items: GalleryMediaItem[] = [
      { id: '1', type: 'image', url: 'https://cdn.com/p1.png', originalIndex: 1 },
      { id: '2', type: 'image', url: 'https://cdn.com/p2.png', originalIndex: 2 },
      { id: '3', type: 'image', url: 'https://cdn.com/p3.png', originalIndex: 3 },
    ];
    const aspectMap: Record<string, ScreenshotAspect> = {
      'https://cdn.com/p1.png': 'portrait',
      'https://cdn.com/p2.png': 'portrait',
      'https://cdn.com/p3.png': 'portrait',
    };

    const rows = organizeScreenshotGrid(items, aspectMap);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.cells).toHaveLength(3);
    expect(rows[0]!.cells[0]!.colSpan).toBe(4);
    expect(rows[0]!.cells[1]!.colSpan).toBe(4);
    expect(rows[0]!.cells[2]!.colSpan).toBe(4);
  });

  it('pairs 2 consecutive portraits as col-6 + col-6', () => {
    const items: GalleryMediaItem[] = [
      { id: '1', type: 'image', url: 'https://cdn.com/p1.png', originalIndex: 1 },
      { id: '2', type: 'image', url: 'https://cdn.com/p2.png', originalIndex: 2 },
    ];
    const aspectMap: Record<string, ScreenshotAspect> = {
      'https://cdn.com/p1.png': 'portrait',
      'https://cdn.com/p2.png': 'portrait',
    };

    const rows = organizeScreenshotGrid(items, aspectMap);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.cells).toHaveLength(2);
    expect(rows[0]!.cells[0]!.colSpan).toBe(6);
    expect(rows[0]!.cells[1]!.colSpan).toBe(6);
  });

  it('optimally packs Glorov real-world screenshot distribution [L, P, L, L, P, L, P, L]', () => {
    const items: GalleryMediaItem[] = [
      { id: 'g1', type: 'image', url: 'u1', originalIndex: 1 },
      { id: 'g2', type: 'image', url: 'u2', originalIndex: 2 },
      { id: 'g3', type: 'image', url: 'u3', originalIndex: 3 },
      { id: 'g4', type: 'image', url: 'u4', originalIndex: 4 },
      { id: 'g5', type: 'image', url: 'u5', originalIndex: 5 },
      { id: 'g6', type: 'image', url: 'u6', originalIndex: 6 },
      { id: 'g7', type: 'image', url: 'u7', originalIndex: 7 },
      { id: 'g8', type: 'image', url: 'u8', originalIndex: 8 },
    ];
    const aspectMap: Record<string, ScreenshotAspect> = {
      u1: 'landscape',
      u2: 'portrait',
      u3: 'landscape',
      u4: 'landscape',
      u5: 'portrait',
      u6: 'landscape',
      u7: 'portrait',
      u8: 'landscape',
    };

    const rows = organizeScreenshotGrid(items, aspectMap);
    expect(rows).toHaveLength(4);

    // Row 1: #1 (L, 8) + #2 (P, 4) = 12
    expect(rows[0]!.cells[0]!.item.id).toBe('g1');
    expect(rows[0]!.cells[0]!.colSpan).toBe(8);
    expect(rows[0]!.cells[1]!.item.id).toBe('g2');
    expect(rows[0]!.cells[1]!.colSpan).toBe(4);

    // Row 2: #3 (L, 8) + #5 (P, 4) = 12 (promoted #5)
    expect(rows[1]!.cells[0]!.item.id).toBe('g3');
    expect(rows[1]!.cells[0]!.colSpan).toBe(8);
    expect(rows[1]!.cells[1]!.item.id).toBe('g5');
    expect(rows[1]!.cells[1]!.colSpan).toBe(4);

    // Row 3: #4 (L, 8) + #7 (P, 4) = 12 (promoted #7)
    expect(rows[2]!.cells[0]!.item.id).toBe('g4');
    expect(rows[2]!.cells[0]!.colSpan).toBe(8);
    expect(rows[2]!.cells[1]!.item.id).toBe('g7');
    expect(rows[2]!.cells[1]!.colSpan).toBe(4);

    // Row 4: #6 (L, 6) + #8 (L, 6) = 12
    expect(rows[3]!.cells[0]!.item.id).toBe('g6');
    expect(rows[3]!.cells[0]!.colSpan).toBe(6);
    expect(rows[3]!.cells[1]!.item.id).toBe('g8');
    expect(rows[3]!.cells[1]!.colSpan).toBe(6);

    // All rows sum up to exactly 12 columns
    for (const row of rows) {
      const sum = row.cells.reduce((acc, c) => acc + c.colSpan, 0);
      expect(sum).toBe(12);
    }
  });
});
