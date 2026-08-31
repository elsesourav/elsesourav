import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@elsesourav/database';
import { checkRateLimit, extractClientIp } from '@elsesourav/utils';
import { SyncUserAuthSchema } from '@elsesourav/validation';

const userRepo = new UserRepository();

export async function POST(request: NextRequest) {
  try {
    const clientIp = extractClientIp(request.headers);
    const rateLimit = checkRateLimit(`auth-sync:${clientIp}`, 30, 60000);

    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many sync requests. Please wait.' }, { status: 429 });
    }

    const rawBody = await request.json();
    const parsed = SyncUserAuthSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid sync payload' },
        { status: 400 }
      );
    }

    const { supabaseAuthId, email, displayName, username, photoUrl } = parsed.data;

    const user = await userRepo.syncUserAuth({
      supabaseAuthId: supabaseAuthId.trim(),
      email: email.trim().toLowerCase(),
      displayName: displayName ? displayName.trim() : undefined,
      username: username ? username.trim().toLowerCase() : undefined,
      photoUrl: photoUrl ? photoUrl.trim() : undefined,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to synchronize user auth profile',
      },
      { status: 500 }
    );
  }
}
