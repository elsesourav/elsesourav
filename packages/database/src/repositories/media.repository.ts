import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { AppError } from '@elsesourav/types';
import type { AdminMediaItem, AdminMediaReference, MediaDomain } from '@elsesourav/types';

export class MediaRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  /**
   * Scans database relationships and media registry to identify all active media assets
   */
  async getReferencedMediaMap(): Promise<
    Map<
      string,
      { domain: MediaDomain; references: AdminMediaReference[]; createdAt: number; title: string }
    >
  > {
    const mediaMap = new Map<
      string,
      { domain: MediaDomain; references: AdminMediaReference[]; createdAt: number; title: string }
    >();

    const addRef = (
      url: string | null | undefined,
      ref: AdminMediaReference | null,
      domain: MediaDomain,
      createdAt: Date,
      title: string
    ) => {
      if (!url || typeof url !== 'string' || url.trim().length === 0) return;
      const cleanUrl = url.trim();
      const existing = mediaMap.get(cleanUrl);
      if (existing) {
        if (ref) existing.references.push(ref);
      } else {
        mediaMap.set(cleanUrl, {
          domain,
          references: ref ? [ref] : [],
          createdAt: createdAt.getTime(),
          title,
        });
      }
    };

    const [apps, posts, users, ticketMessages, siteSettings] = await Promise.all([
      this.prisma.app.findMany({
        where: { deletedAt: null },
        select: { id: true, name: true, iconUrl: true, featuredImageUrl: true, createdAt: true },
      }),
      this.prisma.blogPost.findMany({
        where: { deletedAt: null },
        select: { id: true, title: true, coverImageUrl: true, createdAt: true },
      }),
      this.prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true, displayName: true, photoUrl: true, createdAt: true },
      }),
      this.prisma.ticketMessage.findMany({
        select: { id: true, ticketId: true, attachments: true, createdAt: true },
      }),
      this.prisma.siteSetting.findMany({
        where: {
          key: {
            in: ['creator_avatar_url', 'media_library_items_json'],
          },
        },
      }),
    ]);

    // Apps references
    for (const app of apps) {
      if (app.iconUrl) {
        addRef(
          app.iconUrl,
          {
            resourceType: 'App',
            resourceId: app.id,
            resourceName: app.name,
            fieldName: 'iconUrl',
          },
          'apps',
          app.createdAt,
          `${app.name} (Icon)`
        );
      }
      if (app.featuredImageUrl) {
        addRef(
          app.featuredImageUrl,
          {
            resourceType: 'App',
            resourceId: app.id,
            resourceName: app.name,
            fieldName: 'featuredImageUrl',
          },
          'apps',
          app.createdAt,
          `${app.name} (Banner)`
        );
      }
    }

    // Blog Post references
    for (const post of posts) {
      if (post.coverImageUrl) {
        addRef(
          post.coverImageUrl,
          {
            resourceType: 'BlogPost',
            resourceId: post.id,
            resourceName: post.title,
            fieldName: 'coverImageUrl',
          },
          'blog',
          post.createdAt,
          post.title
        );
      }
    }

    // User references
    for (const user of users) {
      if (user.photoUrl) {
        addRef(
          user.photoUrl,
          {
            resourceType: 'User',
            resourceId: user.id,
            resourceName: user.displayName,
            fieldName: 'photoUrl',
          },
          'users',
          user.createdAt,
          `${user.displayName} (Avatar)`
        );
      }
    }

    // Support ticket messages
    for (const msg of ticketMessages) {
      for (const att of msg.attachments) {
        addRef(
          att,
          {
            resourceType: 'SupportTicket',
            resourceId: msg.ticketId,
            resourceName: `Ticket #${msg.ticketId.slice(0, 8)} Attachment`,
            fieldName: 'attachments',
          },
          'support',
          msg.createdAt,
          `Ticket Attachment`
        );
      }
    }

    // Site Settings (Creator Avatar / Logo / OG Banner)
    const creatorAvatar = siteSettings.find((s) => s.key === 'creator_avatar_url')?.value;
    if (creatorAvatar) {
      addRef(
        creatorAvatar,
        {
          resourceType: 'SiteSetting',
          resourceId: 'creator_avatar_url',
          resourceName: 'Creator Profile & About Photo',
          fieldName: 'creator_avatar_url',
        },
        'users',
        new Date(),
        'Creator Avatar'
      );
    }

    const siteLogo = siteSettings.find((s) => s.key === 'site_logo_url')?.value;
    if (siteLogo) {
      addRef(
        siteLogo,
        {
          resourceType: 'SiteSetting',
          resourceId: 'site_logo_url',
          resourceName: 'Site Brand Logo / Icon',
          fieldName: 'site_logo_url',
        },
        'general',
        new Date(),
        'Brand Logo'
      );
    }

    const siteOgImage = siteSettings.find((s) => s.key === 'site_og_image_url')?.value;
    if (siteOgImage) {
      addRef(
        siteOgImage,
        {
          resourceType: 'SiteSetting',
          resourceId: 'site_og_image_url',
          resourceName: 'OpenGraph Social Banner',
          fieldName: 'site_og_image_url',
        },
        'general',
        new Date(),
        'OG Share Banner'
      );
    }

    // Direct Uploaded Media registry items
    const mediaRegistryRaw = siteSettings.find((s) => s.key === 'media_library_items_json')?.value;
    if (mediaRegistryRaw) {
      try {
        const directItems = JSON.parse(mediaRegistryRaw);
        if (Array.isArray(directItems)) {
          for (const item of directItems) {
            if (item && item.url) {
              const itemDomain = (item.domain || item.folder || 'general') as MediaDomain;
              addRef(
                item.url,
                null,
                itemDomain,
                item.createdAt ? new Date(item.createdAt) : new Date(),
                item.title || item.publicId || 'Media Asset'
              );
            }
          }
        }
      } catch {
        // Safe fallback
      }
    }

    return mediaMap;
  }

  /**
   * Helper to derive a clean public ID from a URL
   */
  extractPublicId(url: string): string {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
      if (match && match[1]) {
        return match[1];
      }
      const filenameMatch = url.match(/\/([^/?#]+)$/);
      if (filenameMatch && filenameMatch[1]) {
        return filenameMatch[1];
      }
    } catch {
      // Fallback
    }
    return url;
  }

  /**
   * Checks whether a publicId or URL is currently referenced by any active entity in PostgreSQL
   */
  async checkAssetReferences(publicIdOrUrl: string): Promise<AdminMediaReference[]> {
    const map = await this.getReferencedMediaMap();
    for (const [url, data] of map.entries()) {
      if (
        url === publicIdOrUrl ||
        url.includes(publicIdOrUrl) ||
        this.extractPublicId(url) === publicIdOrUrl
      ) {
        return data.references;
      }
    }
    return [];
  }

  /**
   * Automatically records an uploaded media asset into the Media Library registry
   */
  async recordUploadedAsset(
    adminUserId: string,
    asset: {
      url: string;
      publicId: string;
      domain: MediaDomain;
      title: string;
      format?: string;
      width?: number;
      height?: number;
      bytes?: number;
    }
  ): Promise<void> {
    try {
      const setting = await this.prisma.siteSetting.findUnique({
        where: { key: 'media_library_items_json' },
      });

      let existing: Array<{
        url: string;
        publicId: string;
        domain: MediaDomain;
        title: string;
        format?: string;
        width?: number;
        height?: number;
        bytes?: number;
        createdAt: number;
      }> = [];

      if (setting?.value) {
        try {
          const parsed = JSON.parse(setting.value);
          if (Array.isArray(parsed)) existing = parsed;
        } catch {
          existing = [];
        }
      }

      // Check if duplicate url
      if (!existing.some((e) => e.url === asset.url)) {
        existing.unshift({
          url: asset.url,
          publicId: asset.publicId,
          domain: asset.domain,
          title: asset.title,
          format: asset.format,
          width: asset.width,
          height: asset.height,
          bytes: asset.bytes,
          createdAt: Date.now(),
        });
      }

      // Cap at 200 items in json registry
      const capped = existing.slice(0, 200);

      await this.prisma.siteSetting.upsert({
        where: { key: 'media_library_items_json' },
        create: {
          key: 'media_library_items_json',
          value: JSON.stringify(capped),
          description: 'Direct uploads and registered media assets',
          updatedBy: adminUserId,
        },
        update: {
          value: JSON.stringify(capped),
          updatedBy: adminUserId,
        },
      });

      await this.logMediaAudit(adminUserId, 'MEDIA_ASSET_UPLOADED', asset.publicId, {
        url: asset.url,
        domain: asset.domain,
        title: asset.title,
      });
    } catch (error) {
      // Non-blocking error
      console.error('Failed to register uploaded media asset:', error);
    }
  }

  /**
   * Lists administrative media items aggregated across the system
   */
  async listAdminMedia(
    options: {
      domain?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{
    items: AdminMediaItem[];
    total: number;
    totalReferenced: number;
    totalOrphans: number;
  }> {
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.min(Math.max(options.limit ?? 24, 1), 100);

    const refMap = await this.getReferencedMediaMap();

    const allItems: AdminMediaItem[] = [];
    let totalReferenced = 0;
    let totalOrphans = 0;

    for (const [url, data] of refMap.entries()) {
      const publicId = this.extractPublicId(url);
      const isReferenced = data.references.length > 0;
      if (isReferenced) totalReferenced++;
      else totalOrphans++;

      allItems.push({
        id: publicId,
        publicId,
        secureUrl: url,
        domain: data.domain,
        createdAt: data.createdAt,
        isReferenced,
        references: data.references,
      });
    }

    // Apply filtering
    let filtered = allItems;

    if (options.domain && options.domain !== 'all') {
      filtered = filtered.filter((item) => item.domain === options.domain);
    }

    if (options.status && options.status !== 'all') {
      if (options.status === 'referenced') {
        filtered = filtered.filter((item) => item.isReferenced);
      } else if (options.status === 'orphan') {
        filtered = filtered.filter((item) => !item.isReferenced);
      }
    }

    if (options.search && options.search.trim().length > 0) {
      const q = options.search.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        const matchesPublicId = item.publicId.toLowerCase().includes(q);
        const matchesUrl = item.secureUrl.toLowerCase().includes(q);
        const matchesRef = item.references.some((r) => r.resourceName.toLowerCase().includes(q));
        return matchesPublicId || matchesUrl || matchesRef;
      });
    }

    // Sort by recent first
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      totalReferenced,
      totalOrphans,
    };
  }

  /**
   * Logs an audit record when an asset is deleted or replaced
   */
  async logMediaAudit(
    adminUserId: string,
    action: string,
    publicId: string,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action,
          entityType: 'MediaAsset',
          entityId: publicId,
          details: details as object,
        },
      });
    } catch (error) {
      throw AppError.database('Failed to record media audit log', error);
    }
  }
}
