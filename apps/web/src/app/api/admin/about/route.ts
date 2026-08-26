import { NextResponse } from "next/server";
import { prisma } from "@elsesourav/db";
import { requireAdminSession } from "@/lib/auth-guard";
import type { ApiResponse } from "@elsesourav/types";

export async function GET(req: Request) {
  const authRes = await requireAdminSession(req);
  if (authRes.response) return authRes.response;

  try {
    const [profileImage, nameLogo, aboutPage, socialLinks] = await Promise.all([
      prisma.imageConfig.findFirst({
        where: { section: "ABOUT_PROFILE", isActive: true },
      }),
      prisma.imageConfig.findFirst({
        where: { section: "ABOUT_NAME_LOGO", isActive: true },
      }),
      prisma.contentPage.findUnique({
        where: { slug: "about" },
      }),
      prisma.socialLink.findMany({
        orderBy: { order: "asc" },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        profileImage,
        nameLogo,
        summary: aboutPage?.summary || "",
        body: aboutPage?.body || "",
        socialLinks,
      },
    } as ApiResponse<any>);
  } catch (error) {
    console.error("Failed to fetch about settings:", error);
    return NextResponse.json({ ok: false, error: { message: "Internal Server Error" } }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authRes = await requireAdminSession(req);
  if (authRes.response) return authRes.response;
  const user = authRes.session.user;

  try {
    const payload = await req.json();
    const { summary, body, socialLinks } = payload;

    // 1. Update the Summary and Body in ContentPage
    if (typeof summary === "string" && typeof body === "string") {
      await prisma.contentPage.upsert({
        where: { slug: "about" },
        update: { summary, body },
        create: {
          slug: "about",
          title: "About",
          summary,
          body,
          status: "PUBLISHED",
          createdBy: user.id,
        },
      });
    }

    // 2. Update Social Links
    if (Array.isArray(socialLinks)) {
      const currentLinks = await prisma.socialLink.findMany();
      const currentIds = currentLinks.map((l: any) => l.id);
      const incomingIds = socialLinks.map((l: any) => l.id).filter(Boolean);
      
      const idsToDelete = currentIds.filter((id: any) => !incomingIds.includes(id));
      
      if (idsToDelete.length > 0) {
        await prisma.socialLink.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      for (const [index, link] of socialLinks.entries()) {
        if (link.id) {
          await prisma.socialLink.update({
            where: { id: link.id },
            data: {
              platform: link.platform,
              url: link.url,
              iconUrl: link.iconUrl,
              isActive: link.isActive ?? true,
              order: index,
            },
          });
        } else {
          await prisma.socialLink.create({
            data: {
              platform: link.platform,
              url: link.url,
              iconUrl: link.iconUrl,
              isActive: link.isActive ?? true,
              order: index,
            },
          });
        }
      }
    }

    // 3. Image Configs are now managed directly via /api/admin/images/configs

    return NextResponse.json({ ok: true } as ApiResponse<null>);
  } catch (error) {
    console.error("Failed to update about settings:", error);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
