import nodemailer from 'nodemailer';

export interface SendPasswordResetEmailOptions {
  to: string;
  resetUrl: string;
  displayName?: string;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  displayName,
}: SendPasswordResetEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const smtpUser =
      process.env.NODEMAILER_USER || process.env.SMTP_USER || 'elsesourav.auth@gmail.com';
    const smtpPass =
      process.env.NODEMAILER_PASS || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpHost = process.env.NODEMAILER_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.NODEMAILER_PORT || process.env.SMTP_PORT || 465);

    // If SMTP credentials are configured, send real email via Nodemailer
    if (smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

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
            
            <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #27272a; color: #71717a; font-size: 11px;">
              <p style="margin: 0;">Sent by ElseSourav Auth &lt;elsesourav.auth@gmail.com&gt;</p>
              <p style="margin: 4px 0 0 0;">If the button above does not work, copy and paste this link into your browser:<br/>
                <a href="${resetUrl}" style="color: #6366f1; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"ElseSourav Security" <${smtpUser}>`,
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
