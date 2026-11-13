import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/features/admin/guards/require-admin';
import { processAdminImageUpload } from '@/features/admin/media/services/admin-image-upload';
import type { MediaFolder } from '@elsesourav/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Dedicated Admin Media Upload API Route
 *
 * Accepts multipart/form-data payloads directly with standard streaming request handling,
 * bypassing Next.js Server Action body parsing restrictions and avoiding 413 errors.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminContext();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Administrative access required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as MediaFolder) || 'general';

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No image file provided in request' },
        { status: 400 }
      );
    }

    const result = await processAdminImageUpload({
      file,
      folder,
      userId: admin.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to upload image' },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal upload error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
