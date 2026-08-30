import { NextRequest, NextResponse } from 'next/server';
import { UserRepository, UserService } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { checkRateLimit, extractClientIp } from '@elsesourav/utils';
import { cookies } from 'next/headers';

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

export async function GET(request: NextRequest) {
  try {
    // 1. Spam & Abuse Protection: Rate limit username checks per client IP (45 requests / 60s)
    const clientIp = extractClientIp(request.headers);
    const rateLimit = checkRateLimit(`check-username:${clientIp}`, 45, 60000);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          available: false,
          error: `Too many username checks. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get('username');
    const rawName = searchParams.get('name');
    const wantSuggestions = searchParams.get('suggest') === 'true' || Boolean(rawName);

    // If only name is passed (for generating suggestions), return 2 verified available suggestions
    if (rawName && !rawUsername) {
      const suggestions = await userService.suggestAvailableUsernames(rawName, 2);
      return NextResponse.json(
        { suggestions },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    if (!rawUsername || rawUsername.trim().length === 0) {
      return NextResponse.json(
        { available: false, error: 'Username parameter is required' },
        { status: 400, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    const username = rawUsername.trim();
    if (username.length > 50) {
      return NextResponse.json(
        { available: false, error: 'Username cannot exceed 30 characters' },
        { status: 400, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    const cookieStore = await cookies();
    const session = await getServerSession({
      getAll: () => cookieStore.getAll(),
    });
    const currentUserId = session?.user?.id;

    const result = await userService.checkUsernameAvailability(username, currentUserId);
    let suggestions: string[] = [];

    if (wantSuggestions || !result.available) {
      const baseForSuggestions = rawName || username;
      suggestions = await userService.suggestAvailableUsernames(baseForSuggestions, 2);
    }

    return NextResponse.json(
      {
        ...result,
        suggestions,
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        available: false,
        error: error instanceof Error ? error.message : 'Failed to check username availability',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
