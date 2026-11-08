import { NextRequest, NextResponse } from 'next/server';
import { FeedbackService } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { checkRateLimit, extractClientIp } from '@elsesourav/utils';
import { CreateFeedbackSchema, FeedbackQuerySchema } from '@elsesourav/validation';
import { cookies } from 'next/headers';

const feedbackService = new FeedbackService();

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/apps/[slug]/feedback
 * Public endpoint — returns paginated reviews, summary, and current user's own review.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(request.url);

    const parsed = FeedbackQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid query parameters' },
        { status: 400 }
      );
    }

    // Optionally resolve current user for "your review" and like tracking
    let currentUserId: string | undefined;
    try {
      const cookieStore = await cookies();
      const session = await getServerSession({
        getAll: () => cookieStore.getAll(),
      });
      currentUserId = session?.user?.id;
    } catch {
      // Not authenticated — that's fine for a public endpoint
    }

    const clientIp = extractClientIp(request.headers);
    const clientIdentifier = currentUserId ? `user:${currentUserId}` : `ip:${clientIp}`;

    const result = await feedbackService.getFeedbackForApp(slug, {
      page: parsed.data.page,
      limit: parsed.data.limit,
      sort: parsed.data.sort,
      currentUserId,
      clientIdentifier,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch feedback';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * POST /api/apps/[slug]/feedback
 * Authenticated endpoint — submit or update a review.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    // Auth guard
    const cookieStore = await cookies();
    const session = await getServerSession({
      getAll: () => cookieStore.getAll(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to submit feedback' },
        { status: 401 }
      );
    }

    // Rate limiting
    const clientIp = extractClientIp(request.headers);
    const rateLimit = checkRateLimit(`feedback:${clientIp}:${session.user.id}`, 10, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many feedback submissions. Please wait a moment.' },
        { status: 429 }
      );
    }

    // Validate body
    const rawBody = await request.json();
    const parsed = CreateFeedbackSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid feedback data' },
        { status: 400 }
      );
    }

    const feedback = await feedbackService.submitFeedback(
      session.user.id,
      slug,
      parsed.data.rating,
      parsed.data.message || undefined,
      {
        email: session.user.email,
        displayName: session.user.displayName,
        photoUrl: session.user.photoUrl,
      }
    );

    return NextResponse.json({ success: true, feedback }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit feedback';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * DELETE /api/apps/[slug]/feedback
 * Authenticated endpoint — delete the current user's own review.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    // Auth guard
    const cookieStore = await cookies();
    const session = await getServerSession({
      getAll: () => cookieStore.getAll(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to delete feedback' },
        { status: 401 }
      );
    }

    await feedbackService.deleteFeedback(session.user.id, slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete feedback';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
