import { Request, Response } from "express";
import { ProfileService } from "../services/profile.service";
import { getRequestId, sendFailure, sendSuccess } from "../lib/http";
import { z } from "zod";

const profileQuerySchema = z.object({
  slug: z.string().trim().min(2).max(100).optional(),
});

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  getProfile = async (req: Request, res: Response) => {
    const requestId = getRequestId(res);

    try {
      const parsed = profileQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendFailure(
          res,
          requestId,
          "VALIDATION_ERROR",
          "Invalid profile query.",
          400,
          parsed.error.flatten(),
        );
      }

      const profile = await this.profileService.getProfile(parsed.data.slug);

      if (!profile) {
        return sendFailure(res, requestId, "NOT_FOUND", "Profile not found.", 404);
      }

      return sendSuccess(res, requestId, profile);
    } catch (error) {
      console.error("[ProfileController] Error fetching profile:", error);
      return sendFailure(
        res,
        requestId,
        "INTERNAL_ERROR",
        "Failed to fetch profile.",
        500,
      );
    }
  };
}
