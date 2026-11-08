import { NextRequest, NextResponse } from 'next/server';
import { FeedbackService } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { checkRateLimit, extractClientIp } from '@elsesourav/utils';
import { cookies } from 'next/headers';

const feedbackService = new FeedbackService();

interface RouteContext {
  params: Promise<{ slug: string; id: string }>;
}

/**
 * POST /api/apps/[slug]/feedback/[id]/like
 * Rate-limited endpoint to like / vote helpful on a review.
 * Tracks likes per-user (or per-IP for anonymous users) to prevent multiple likes on the same review.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    // Resolve user session if authenticated
    let userId: string | undefined;
    try {
      const cookieStore = await cookies();
      const session = await getServerSession({
        getAll: () => cookieStore.getAll(),
      });
      userId = session?.user?.id;
    } catch {
      // Unauthenticated client
    }

    const ip = extractClientIp(request.headers);
    const identifier = userId ? `user:${userId}` : `ip:${ip}`;

    const rl = checkRateLimit(`feedback-like:${identifier}`, 30, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many like requests. Please try again shortly.' },
        { status: 429 }
      );
    }

    const result = await feedbackService.toggleHelpful(id, identifier, userId);

    return NextResponse.json({
      success: true,
      helpfulCount: result.helpfulCount,
      hasLiked: result.hasLiked,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to like feedback';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
