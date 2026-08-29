import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { AppError } from '@elsesourav/types';
import type {
  AdminMediaItem,
  AdminMediaReference,
  MediaDomain,
} from '@elsesourav/types';

export class MediaRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  /**
   * Scans database relationships to identify all active media references
   */
  async getReferencedMediaMap(): Promise<Map<string, { domain: MediaDomain; references: AdminMediaReference[]; createdAt: number; title: string }>> {
    const mediaMap = new Map<string, { domain: MediaDomain; references: AdminMediaReference[]; createdAt: number; title: string }>();

    const addRef = (url: string | null | undefined, ref: AdminMediaReference, domain: MediaDomain, createdAt: Date, title: string) => {
      if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return;
      const cleanUrl = url.trim();
      const existing = mediaMap.get(cleanUrl);
      if (existing) {
        existing.references.push(ref);
      } else {
        mediaMap.set(cleanUrl, {
          domain,
          references: [ref],
          createdAt: createdAt.getTime(),
          title,
        });
      }
    };

    const [apps, posts, users, ticketMessages] = await Promise.all([
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
    ]);

    // Apps references
    for (const app of apps) {
      if (app.iconUrl) {
        addRef(app.iconUrl, {
          resourceType: 'App',
          resourceId: app.id,
          resourceName: app.name,
          fieldName: 'iconUrl',
        }, 'apps', app.createdAt, `${app.name} (Icon)`);
      }
      if (app.featuredImageUrl) {
        addRef(app.featuredImageUrl, {
          resourceType: 'App',
          resourceId: app.id,
          resourceName: app.name,
          fieldName: 'featuredImageUrl',
        }, 'apps', app.createdAt, `${app.name} (Banner)`);
      }
    }

    // Blog Post references
    for (const post of posts) {
      if (post.coverImageUrl) {
        addRef(post.coverImageUrl, {
          resourceType: 'BlogPost',
          resourceId: post.id,
          resourceName: post.title,
          fieldName: 'coverImageUrl',
        }, 'blog', post.createdAt, post.title);
      }
    }

    // User references
    for (const user of users) {
      if (user.photoUrl) {
        addRef(user.photoUrl, {
          resourceType: 'User',
          resourceId: user.id,
          resourceName: user.displayName,
          fieldName: 'photoUrl',
        }, 'users', user.createdAt, `${user.displayName} (Avatar)`);
      }
    }

    // Support ticket messages
    for (const msg of ticketMessages) {
      for (const att of msg.attachments) {
        addRef(att, {
          resourceType: 'SupportTicket',
          resourceId: msg.ticketId,
          resourceName: `Ticket #${msg.ticketId.slice(0, 8)} Attachment`,
          fieldName: 'attachments',
        }, 'support', msg.createdAt, `Ticket Attachment`);
      }
    }

    return mediaMap;
  }

  /**
   * Helper to derive a clean Cloudinary public ID from a secure URL
   */
  extractPublicId(url: string): string {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
      if (match && match[1]) {
        return match[1];
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
      if (url === publicIdOrUrl || url.includes(publicIdOrUrl) || this.extractPublicId(url) === publicIdOrUrl) {
        return data.references;
      }
    }
    return [];
  }

  /**
   * Lists administrative media items aggregated across the system
   */
  async listAdminMedia(options: {
    domain?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
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
        const matchesRef = item.references.some((r) =>
          r.resourceName.toLowerCase().includes(q)
        );
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
