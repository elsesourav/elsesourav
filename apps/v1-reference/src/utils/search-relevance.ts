/**
 * Search Relevance & Query Normalization Engine
 * Deterministic multi-tier scoring based on active domain entities.
 */

export interface RelevanceScoreResult {
  readonly score: number;
  readonly matchReason:
    'exact_title' | 'prefix_title' | 'title_contains' | 'tag_match' | 'content_match';
}

/**
 * Normalizes user queries safely without distorting intent:
 * - Trims leading/trailing whitespace
 * - Converts to lowercase
 * - Collapses multiple spaces
 * - Normalizes punctuation (dashes, slashes, punctuation symbols)
 */
export function normalizeSearchQuery(rawQuery: string): string {
  if (!rawQuery) return '';
  return rawQuery
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits query into clean search tokens (min length 1)
 */
export function extractSearchTokens(normalizedQuery: string): string[] {
  return normalizedQuery.split(/\s+/).filter(Boolean);
}

/**
 * Calculates a deterministic relevance score (0 - 120) for an item based on query matches.
 *
 * Priority Tiers:
 * 1. Exact title or slug match: 100 base points
 * 2. Title/slug starts with query (prefix): 80 base points
 * 3. Title/slug contains full query: 60 base points
 * 4. Tag or Category exact/substring match: 40 base points
 * 5. Description or Content match: 20 base points
 *
 * Modifiers:
 * + Token match bonus: +5 per individual matched token
 * + Domain boost: +2 for applications (primary software domain)
 */
export function calculateRelevance(
  query: string,
  tokens: string[],
  entity: {
    readonly title: string;
    readonly slug: string;
    readonly description?: string;
    readonly category?: string;
    readonly tags?: readonly string[];
    readonly isApp?: boolean;
  }
): RelevanceScoreResult | null {
  if (!query || tokens.length === 0) return null;

  const normalizedTitle = entity.title.toLowerCase().trim();
  const normalizedSlug = entity.slug.toLowerCase().trim();
  const normalizedDesc = (entity.description || '').toLowerCase();
  const normalizedCategory = (entity.category || '').toLowerCase();
  const normalizedTags = (entity.tags || []).map((t) => t.toLowerCase());

  // Check if all tokens are present somewhere in the entity text
  const fullEntityText = `${normalizedTitle} ${normalizedSlug} ${normalizedDesc} ${normalizedCategory} ${normalizedTags.join(' ')}`;
  const allTokensMatch = tokens.every((tok) => fullEntityText.includes(tok));
  if (!allTokensMatch) return null;

  let baseScore = 0;
  let matchReason: RelevanceScoreResult['matchReason'] = 'content_match';

  // Tier 1: Exact title or slug match
  if (normalizedTitle === query || normalizedSlug === query) {
    baseScore = 100;
    matchReason = 'exact_title';
  }
  // Tier 2: Title or slug starts with query
  else if (normalizedTitle.startsWith(query) || normalizedSlug.startsWith(query)) {
    baseScore = 80;
    matchReason = 'prefix_title';
  }
  // Tier 3: Title or slug contains full query
  else if (normalizedTitle.includes(query) || normalizedSlug.includes(query)) {
    baseScore = 60;
    matchReason = 'title_contains';
  }
  // Tier 4: Category or Tag match
  else if (
    normalizedCategory === query ||
    normalizedCategory.includes(query) ||
    normalizedTags.some((t) => t === query || t.includes(query))
  ) {
    baseScore = 40;
    matchReason = 'tag_match';
  }
  // Tier 5: Description or content match
  else if (normalizedDesc.includes(query)) {
    baseScore = 20;
    matchReason = 'content_match';
  } else {
    baseScore = 10;
    matchReason = 'content_match';
  }

  // Token bonus: +5 points for each token found in the title
  let tokenBonus = 0;
  for (const tok of tokens) {
    if (normalizedTitle.includes(tok)) tokenBonus += 5;
    if (normalizedTags.includes(tok)) tokenBonus += 3;
  }

  // App domain tie-breaker boost
  const appBoost = entity.isApp ? 2 : 0;

  return {
    score: baseScore + tokenBonus + appBoost,
    matchReason,
  };
}
