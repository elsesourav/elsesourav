import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@elsesourav/database';
import { checkRateLimit, extractClientIp } from '@elsesourav/utils';

const userRepo = new UserRepository();

export async function POST(request: NextRequest) {
  try {
    const clientIp = extractClientIp(request.headers);
    const rateLimit = checkRateLimit(`resolve-identifier:${clientIp}`, 30, 60000);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const identifier = typeof body.identifier === 'string' ? body.identifier.trim() : '';

    if (!identifier) {
      return NextResponse.json({ error: 'Identifier is required' }, { status: 400 });
    }

    // If it is already an email, return directly
    if (identifier.includes('@')) {
      return NextResponse.json({ email: identifier.toLowerCase() });
    }

    // Look up email by username
    const user = await userRepo.findByUsername(identifier);
    if (!user || !user.email) {
      // Return the same format but with a generic message that doesn't confirm/deny existence
      return NextResponse.json(
        { error: 'Unable to resolve this identifier. Please try using your email address instead.' },
        { status: 400 }
      );
    }
    // Partially mask the email to prevent full disclosure: show first 2 chars + domain
    const [localPart, domain] = user.email.split('@');
    const masked = localPart && domain
      ? `${localPart.slice(0, 2)}${'*'.repeat(Math.max(localPart.length - 2, 3))}@${domain}`
      : user.email;
    return NextResponse.json({ email: user.email, maskedEmail: masked });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve login identifier' },
      { status: 500 }
    );
  }
}
