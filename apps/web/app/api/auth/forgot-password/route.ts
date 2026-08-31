import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@elsesourav/database';
import { createAuthServerClient } from '@elsesourav/auth';
import { checkRateLimit, extractClientIp } from '@elsesourav/utils';
import { cookies } from 'next/headers';
import { sendPasswordResetEmail } from '@/lib/mailer';

const userRepo = new UserRepository();

export async function POST(request: NextRequest) {
  try {
    const clientIp = extractClientIp(request.headers);
    const rateLimit = checkRateLimit(`forgot-password:${clientIp}`, 10, 60000);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many password reset attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const input = typeof body.email === 'string' ? body.email.trim() : '';

    if (!input) {
      return NextResponse.json({ error: 'Email address or username is required' }, { status: 400 });
    }

    let targetEmail = input.toLowerCase();

    // If username was entered, resolve user email from database
    if (!targetEmail.includes('@')) {
      const user = await userRepo.findByUsername(targetEmail);
      if (user?.email) {
        targetEmail = user.email.toLowerCase();
      } else {
        // Return generic success to prevent email/username enumeration attacks
        return NextResponse.json({
          success: true,
          message:
            'If an account matches that email or username, a reset link has been dispatched.',
        });
      }
    }

    const cookieStore = await cookies();
    const supabase = createAuthServerClient({
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    });

    const origin = request.nextUrl.origin || 'http://localhost:3000';
    const redirectUrl = `${origin}/reset-password`;

    // 1. Supabase standard password reset flow
    const { error: _supabaseError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: redirectUrl,
    });

    // 2. Custom Nodemailer SMTP dispatch from elsesourav.auth@gmail.com
    await sendPasswordResetEmail({
      to: targetEmail,
      resetUrl: redirectUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'If an account matches that email or username, a reset link has been dispatched.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred processing your request',
      },
      { status: 500 }
    );
  }
}
