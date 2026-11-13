export type ScreenshotAspect = 'landscape' | 'portrait';

export interface GalleryMediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  originalIndex: number;
}

export interface GridCell {
  item: GalleryMediaItem;
  colSpan: number; // 4, 6, 8, 12
  isCentered?: boolean;
}

export interface GridRow {
  id: string;
  cells: GridCell[];
}

/**
 * Organizes gallery screenshots into balanced responsive grid rows on desktop.
 *
 * Rules:
 * 1. Landscape + Portrait pairing: col-8 + col-4 or col-4 + col-8.
 * 2. Consecutive Landscapes: if immediately followed by a Portrait, promote that portrait
 *    one position up to pair with the first landscape (L + P), leaving the second landscape
 *    for subsequent rows. Otherwise, pair the two landscapes as col-6 + col-6.
 * 3. Consecutive Portraits: if three appear in a row, stack 3 in one row (col-4 + col-4 + col-4).
 *    If two portraits appear, pair as col-6 + col-6.
 * 4. Single remaining items: single landscape spans full width (col-12); single portrait is centered (col-6).
 */
export function organizeScreenshotGrid(
  items: readonly GalleryMediaItem[],
  aspectMap: Record<string, ScreenshotAspect>
): GridRow[] {
  const rows: GridRow[] = [];
  const queue = [...items];

  const getAspect = (item: GalleryMediaItem): ScreenshotAspect => {
    if (item.type === 'video') return 'landscape';
    return aspectMap[item.url] || 'landscape';
  };

  let rowCounter = 0;

  while (queue.length > 0) {
    rowCounter += 1;
    const rowId = `row-${rowCounter}`;

    // Single item remaining
    if (queue.length === 1) {
      const single = queue.shift();
      if (!single) break;
      const isPortrait = getAspect(single) === 'portrait';
      rows.push({
        id: rowId,
        cells: [
          {
            item: single,
            colSpan: isPortrait ? 6 : 12,
            isCentered: isPortrait,
          },
        ],
      });
      break;
    }

    const first = queue[0];
    const second = queue[1];
    if (!first || !second) {
      const remaining = queue.shift();
      if (remaining) {
        rows.push({
          id: rowId,
          cells: [{ item: remaining, colSpan: 12 }],
        });
      }
      break;
    }

    const third = queue[2];

    const firstAspect = getAspect(first);
    const secondAspect = getAspect(second);
    const thirdAspect = third ? getAspect(third) : null;

    // CASE 1: First item is Landscape
    if (firstAspect === 'landscape') {
      if (secondAspect === 'portrait') {
        // [Landscape (8), Portrait (4)]
        queue.shift();
        queue.shift();
        rows.push({
          id: rowId,
          cells: [
            { item: first, colSpan: 8 },
            { item: second, colSpan: 4 },
          ],
        });
        continue;
      }

      // First is Landscape, Second is Landscape
      if (secondAspect === 'landscape') {
        if (third && thirdAspect === 'portrait') {
          // Rule: 2 landscapes, then portrait -> promote portrait one position up!
          queue.splice(2, 1); // remove promoted portrait
          queue.shift(); // remove first landscape
          rows.push({
            id: rowId,
            cells: [
              { item: first, colSpan: 8 },
              { item: third, colSpan: 4 },
            ],
          });
          continue;
        }

        // Two landscapes without a portrait to promote
        queue.shift();
        queue.shift();
        rows.push({
          id: rowId,
          cells: [
            { item: first, colSpan: 6 },
            { item: second, colSpan: 6 },
          ],
        });
        continue;
      }
    }

    // CASE 2: First item is Portrait
    if (firstAspect === 'portrait') {
      if (secondAspect === 'landscape') {
        // [Portrait (4), Landscape (8)]
        queue.shift();
        queue.shift();
        rows.push({
          id: rowId,
          cells: [
            { item: first, colSpan: 4 },
            { item: second, colSpan: 8 },
          ],
        });
        continue;
      }

      // First is Portrait, Second is Portrait
      if (secondAspect === 'portrait') {
        if (third && thirdAspect === 'portrait') {
          // 3 portraits in a line: col-4 + col-4 + col-4
          queue.shift();
          queue.shift();
          queue.shift();
          rows.push({
            id: rowId,
            cells: [
              { item: first, colSpan: 4 },
              { item: second, colSpan: 4 },
              { item: third, colSpan: 4 },
            ],
          });
          continue;
        }

        // 2 portraits: col-6 + col-6
        queue.shift();
        queue.shift();
        rows.push({
          id: rowId,
          cells: [
            { item: first, colSpan: 6 },
            { item: second, colSpan: 6 },
          ],
        });
        continue;
      }
    }

    // Fallback safeguard to prevent infinite loop on unanticipated state
    const fallbackItem = queue.shift();
    if (fallbackItem) {
      rows.push({
        id: rowId,
        cells: [{ item: fallbackItem, colSpan: 12 }],
      });
    }
  }

  return rows;
}
