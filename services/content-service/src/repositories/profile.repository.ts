import { prisma } from "@elsesourav/db";

export class ProfileRepository {
  async getProfileBySlug(slug: string | undefined) {
    return prisma.profilePage.findFirst({
      where: slug ? { slug, isActive: true } : { isActive: true },
    });
  }
}
