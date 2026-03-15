import { failure, success } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/auth-guard";
import { getCloudinary } from "@/lib/cloudinary";
import { requireEnv } from "@elsesourav/config";
import { cloudinarySignSchema } from "@elsesourav/validation";

export async function POST(request: Request) {
  const adminResult = await requireAdminSession(request);
  if (adminResult.response) {
    return adminResult.response;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = cloudinarySignSchema.safeParse(body);

    if (!parsed.success) {
      return failure(
        adminResult.requestId,
        "VALIDATION_ERROR",
        "Invalid upload signature payload.",
        400,
        {
          issues: parsed.error.flatten(),
        },
      );
    }

    const timestamp = parsed.data.timestamp ?? Math.floor(Date.now() / 1000);
    const paramsToSign = {
      folder: parsed.data.folder,
      timestamp,
    };

    const env = requireEnv([
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ]);

    const cloudinary = getCloudinary();
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET,
    );

    return success(adminResult.requestId, {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      folder: parsed.data.folder,
      timestamp,
      signature,
    });
  } catch (error) {
    return failure(
      adminResult.requestId,
      "INTERNAL_ERROR",
      "Failed to generate Cloudinary signature.",
      500,
      {
        reason: error instanceof Error ? error.message : "Unknown error",
      },
    );
  }
}
