import { prisma } from '../client';
import { AppError } from '@elsesourav/types';
import crypto from 'node:crypto';

function hashOtp(otp: string, email: string): string {
  const secret = process.env.OTP_SECRET || 'elsesourav-otp-security-salt-2026';
  return crypto.createHmac('sha256', secret).update(`${email.toLowerCase()}:${otp}`).digest('hex');
}

export class OtpRepository {
  private get prisma() {
    return prisma;
  }

  /**
   * Save a newly generated 6-digit OTP code with 10-minute expiration.
   */
  async createOtp(
    email: string,
    otp: string,
    purpose: 'EMAIL_VERIFY' | 'PASSWORD_RESET' = 'EMAIL_VERIFY',
    ttlMinutes = 10
  ): Promise<void> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const otpHash = hashOtp(otp, normalizedEmail);
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      // Clean up previous OTPs for the same email and purpose
      await this.prisma.emailOtp.deleteMany({
        where: {
          email: normalizedEmail,
          purpose,
        },
      });

      // Insert new active OTP
      await this.prisma.emailOtp.create({
        data: {
          email: normalizedEmail,
          otpHash,
          purpose,
          expiresAt,
        },
      });
    } catch (error) {
      throw AppError.database(`Failed to store email verification OTP for ${email}`, error);
    }
  }

  /**
   * Validate the entered 6-digit OTP code.
   * If correct, consumes (deletes) the OTP and returns true.
   * If invalid, increments attempt counter and rejects if exceeded.
   */
  async verifyOtp(
    email: string,
    enteredOtp: string,
    purpose: 'EMAIL_VERIFY' | 'PASSWORD_RESET' = 'EMAIL_VERIFY'
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const record = await this.prisma.emailOtp.findFirst({
        where: {
          email: normalizedEmail,
          purpose,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!record) {
        return {
          valid: false,
          error: 'Verification code has expired or was not requested. Please request a new code.',
        };
      }

      if (record.attempts >= 5) {
        // Exceeded maximum attempts — invalidate OTP
        await this.prisma.emailOtp.delete({
          where: { id: record.id },
        });
        return {
          valid: false,
          error: 'Too many incorrect attempts. Please request a new verification code.',
        };
      }

      const expectedHash = hashOtp(enteredOtp.trim(), normalizedEmail);
      const bufRecord = Buffer.from(record.otpHash, 'hex');
      const bufExpected = Buffer.from(expectedHash, 'hex');
      const isValid =
        bufRecord.length === bufExpected.length &&
        crypto.timingSafeEqual(bufRecord, bufExpected);

      if (!isValid) {
        // Increment attempts
        await this.prisma.emailOtp.update({
          where: { id: record.id },
          data: {
            attempts: {
              increment: 1,
            },
          },
        });
        const remaining = 5 - (record.attempts + 1);
        return {
          valid: false,
          error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        };
      }

      // Valid: Consume OTP so it cannot be re-used
      await this.prisma.emailOtp.delete({
        where: { id: record.id },
      });

      return { valid: true };
    } catch (error) {
      throw AppError.database(`Failed to verify email OTP for ${email}`, error);
    }
  }
}
