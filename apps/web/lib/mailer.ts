import nodemailer from 'nodemailer';

export interface SendOtpEmailOptions {
  to: string;
  otp: string;
  purpose: 'EMAIL_VERIFY' | 'PASSWORD_RESET';
  displayName?: string;
}

export interface SendPasswordResetEmailOptions {
  to: string;
  resetUrl: string;
  displayName?: string;
}

function getTransporter() {
  const smtpUser =
    process.env.NODEMAILER_USER || process.env.SMTP_USER || 'elsesourav.auth@gmail.com';
  const smtpPass =
    process.env.NODEMAILER_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.NODEMAILER_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.NODEMAILER_PORT || process.env.SMTP_PORT || 465);

  if (!smtpPass) {
    return null;
  }

  return {
    smtpUser,
    transporter: nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    }),
  };
}

/**
 * Send a genuine 6-digit numeric OTP code via email.
 * Contains NO magic links or sign-in buttons — only the prominent 6-digit code.
 */
export async function sendOtpEmail({
  to,
  otp,
  purpose,
  displayName,
}: SendOtpEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const mailer = getTransporter();
    const recipientName = displayName || to.split('@')[0] || 'Developer';
    const isVerify = purpose === 'EMAIL_VERIFY';

    const subject = isVerify
      ? `${otp} is your ElseSourav email verification code`
      : `${otp} is your ElseSourav password reset code`;

    const title = isVerify ? 'Verify Your Email Address' : 'Password Reset Verification';
    const description = isVerify
      ? 'Please use the 6-digit verification code below to verify your email identity on ElseSourav.'
      : 'A password reset was requested for your account. Please use the 6-digit verification code below to proceed.';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
        <div style="max-width: 540px; margin: 40px auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 20px; padding: 36px; box-shadow: 0 12px 36px rgba(0,0,0,0.6);">
          <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #27272a;">
            <h1 style="color: #6366f1; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">ElseSourav</h1>
            <p style="color: #a1a1aa; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Identity & Security Service</p>
          </div>
          
          <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 12px 0; font-weight: 700;">${title}</h2>
          <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">Hello ${recipientName},</p>
          <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            ${description}
          </p>
          
          <div style="margin: 28px 0; text-align: center;">
            <div style="display: inline-block; background-color: #09090b; border: 2px solid #6366f1; border-radius: 16px; padding: 18px 36px; box-shadow: 0 0 24px rgba(99, 102, 241, 0.25);">
              <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 800; letter-spacing: 12px; color: #818cf8; padding-left: 12px;">
                ${otp}
              </span>
            </div>
            <p style="color: #71717a; font-size: 12px; margin: 12px 0 0 0;">
              This 6-digit code is valid for <strong>10 minutes</strong>.
            </p>
          </div>
          
          <div style="background-color: #27272a; border-radius: 12px; padding: 14px 18px; margin: 24px 0 0 0;">
            <p style="color: #a1a1aa; font-size: 12px; margin: 0; line-height: 1.5;">
              <strong style="color: #fbbf24;">Security Notice:</strong> Never share this code with anyone. ElseSourav team will never ask for your code.
            </p>
          </div>
          
          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #27272a; color: #71717a; font-size: 11px; text-align: center;">
            <p style="margin: 0;">Sent by ElseSourav Security &lt;elsesourav.auth@gmail.com&gt;</p>
            <p style="margin: 4px 0 0 0;">If you did not request this verification, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (mailer) {
      await mailer.transporter.sendMail({
        from: `"ElseSourav Security" <${mailer.smtpUser}>`,
        to,
        subject,
        html: htmlContent,
      });
    } else {
      // In development when SMTP is not configured, log clearly to console
      console.info(
        `\n[DEVELOPMENT EMAIL OTP]\nTo: ${to}\nPurpose: ${purpose}\n6-Digit OTP Code: >>> ${otp} <<<\n`
      );
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to dispatch verification email',
    };
  }
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  displayName,
}: SendPasswordResetEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const mailer = getTransporter();
    if (mailer) {
      const recipientName = displayName || to.split('@')[0] || 'Developer';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your ElseSourav Password</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f4f4f5;">
          <div style="max-width: 560px; margin: 40px auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="margin-bottom: 24px;">
              <h1 style="color: #6366f1; font-size: 20px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">ElseSourav</h1>
              <p style="color: #a1a1aa; font-size: 13px; margin: 4px 0 0 0;">Personal Software Studio & Archive</p>
            </div>
            
            <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Password Reset Request</h2>
            <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">Hello ${recipientName},</p>
            <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
              We received a request to reset the password for your ElseSourav account associated with <strong>${to}</strong>.
            </p>
            
            <div style="margin: 28px 0; text-align: center;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                Reset Password
              </a>
            </div>
            
            <p style="color: #71717a; font-size: 12px; line-height: 1.5;">
              If you didn't request this email, you can safely ignore it. Your password will remain unchanged.
            </p>
          </div>
        </body>
        </html>
      `;

      await mailer.transporter.sendMail({
        from: `"ElseSourav Security" <${mailer.smtpUser}>`,
        to,
        subject: 'Reset your ElseSourav account password',
        html: htmlContent,
      });
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to dispatch password reset email',
    };
  }
}
