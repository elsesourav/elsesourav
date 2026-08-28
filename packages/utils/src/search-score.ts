export function calculateRelevanceScore(
  query: string,
  target: {
    title?: string;
    description?: string;
    tags?: readonly string[];
    category?: string;
  }
): number {
  if (!query || !query.trim()) return 0;
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  let totalScore = 0;

  const titleLower = target.title?.toLowerCase() ?? '';
  const descLower = target.description?.toLowerCase() ?? '';
  const catLower = target.category?.toLowerCase() ?? '';
  const tagsLower = target.tags?.map((t) => t.toLowerCase()) ?? [];

  for (const term of terms) {
    if (titleLower === term) totalScore += 100;
    else if (titleLower.startsWith(term)) totalScore += 50;
    else if (titleLower.includes(term)) totalScore += 25;

    if (tagsLower.includes(term)) totalScore += 30;
    else if (tagsLower.some((t) => t.includes(term))) totalScore += 15;

    if (catLower === term) totalScore += 20;
    else if (catLower.includes(term)) totalScore += 10;

    if (descLower.includes(term)) totalScore += 5;
  }

  return totalScore;
}
