'use server';

import { submitHelpVote } from '../queries/get-help-article';
import { HelpVoteSchema } from '@elsesourav/validation';

export async function castHelpArticleVote(articleId: string, isHelpful: boolean) {
  const parsed = HelpVoteSchema.safeParse({ articleId, isHelpful });
  if (!parsed.success) {
    return { success: false, error: 'Invalid vote parameters' };
  }

  const result = await submitHelpVote(parsed.data.articleId, parsed.data.isHelpful);
  return result;
}
