import { NextRequest, NextResponse } from 'next/server';
import { UserRepository, OtpRepository } from '@elsesourav/database';
import { createAuthAdminClient } from '@elsesourav/auth';
import { checkRateLimit, extractClientIp } from '@elsesourav/utils';
import { sendOtpEmail } from '@/lib/mailer';
import crypto from 'node:crypto';

const userRepo = new UserRepository();
const otpRepo = new OtpRepository();

function generateResetToken(email: string): string {
  const secret = process.env.OTP_SECRET || 'elsesourav-reset-token-secret-2026';
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  const payload = `${email.toLowerCase()}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64url');
}

function verifyResetToken(token: string, email: string): boolean {
  try {
    const secret = process.env.OTP_SECRET || 'elsesourav-reset-token-secret-2026';
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [tokenEmail, expiresStr, signature] = decoded.split(':');
    if (!tokenEmail || !expiresStr || !signature) return false;
    if (tokenEmail.toLowerCase() !== email.toLowerCase()) return false;
    if (Number(expiresStr) < Date.now()) return false;

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${tokenEmail}:${expiresStr}`)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = extractClientIp(request.headers);
    const body = await request.json();
    const action = body.action || 'send-otp';

    // ── Action 1: Send 6-Digit OTP ──────────────────────────────────────────
    if (action === 'send-otp') {
      const rateLimit = checkRateLimit(`forgot-otp:${clientIp}`, 8, 60000);
      if (!rateLimit.success) {
        return NextResponse.json(
          {
            error: `Too many requests. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
          },
          { status: 429 }
        );
      }

      const input = typeof body.identifier === 'string' ? body.identifier.trim() : '';
      if (!input) {
        return NextResponse.json(
          { error: 'Email address or username is required' },
          { status: 400 }
        );
      }

      let targetEmail = input.toLowerCase();
      let displayName: string | undefined;

      // If username was entered, resolve user email from database
      if (!targetEmail.includes('@')) {
        const user = await userRepo.findByUsername(targetEmail);
        if (user?.email) {
          targetEmail = user.email.toLowerCase();
          displayName = user.displayName;
        } else {
          // Generic success to prevent account enumeration
          return NextResponse.json({
            success: true,
            email: targetEmail,
            message: 'If an account exists, a 6-digit verification code has been dispatched.',
          });
        }
      } else {
        const user = await userRepo.findByEmail(targetEmail);
        if (user) {
          displayName = user.displayName;
        }
      }

      // Generate 6-digit numeric code
      const otp = crypto.randomInt(100000, 999999).toString();

      // Store in DB with 10-minute expiry
      await otpRepo.createOtp(targetEmail, otp, 'PASSWORD_RESET', 10);

      // Send email via Nodemailer (no magic links!)
      await sendOtpEmail({
        to: targetEmail,
        otp,
        purpose: 'PASSWORD_RESET',
        displayName,
      });

      return NextResponse.json({
        success: true,
        email: targetEmail,
        message: 'Verification code sent to your email.',
      });
    }

    // ── Action 2: Verify 6-Digit OTP ────────────────────────────────────────
    if (action === 'verify-otp') {
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const otp = typeof body.otp === 'string' ? body.otp.trim() : '';

      if (!email || !otp || otp.length !== 6) {
        return NextResponse.json(
          { error: 'Please enter a valid email and 6-digit verification code' },
          { status: 400 }
        );
      }

      const result = await otpRepo.verifyOtp(email, otp, 'PASSWORD_RESET');
      if (!result.valid) {
        return NextResponse.json(
          { error: result.error || 'Invalid or expired verification code' },
          { status: 400 }
        );
      }

      const resetToken = generateResetToken(email);
      return NextResponse.json({
        success: true,
        resetToken,
      });
    }

    // ── Action 3: Set New Password ──────────────────────────────────────────
    if (action === 'reset-password') {
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const resetToken = typeof body.resetToken === 'string' ? body.resetToken : '';
      const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

      if (!email || !resetToken || !newPassword) {
        return NextResponse.json(
          { error: 'Missing required parameters' },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }

      const isTokenValid = verifyResetToken(resetToken, email);
      if (!isTokenValid) {
        return NextResponse.json(
          { error: 'Password reset session has expired. Please restart the process.' },
          { status: 400 }
        );
      }

      // Find user to get supabaseAuthId
      const user = await userRepo.findByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: 'User account not found' },
          { status: 404 }
        );
      }

      const supabaseAdmin = createAuthAdminClient();
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.supabaseAuthId,
        { password: newPassword }
      );

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message || 'Failed to update password' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred processing your request',
      },
      { status: 500 }
    );
  }
}
