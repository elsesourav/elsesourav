import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { AppError } from '@elsesourav/types';
import type {
  CarouselSlide,
  CreateCarouselSlideInput,
  UpdateCarouselSlideInput,
} from '@elsesourav/types';

export class CarouselRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findAll(options?: { activeOnly?: boolean }): Promise<CarouselSlide[]> {
    try {
      const records = await this.prisma.carouselSlide.findMany({
        where: options?.activeOnly ? { isActive: true } : undefined,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });
      return records;
    } catch (error) {
      throw AppError.database('Failed to fetch carousel slides', error);
    }
  }

  async findById(id: string): Promise<CarouselSlide | null> {
    try {
      return await this.prisma.carouselSlide.findUnique({
        where: { id },
      });
    } catch (error) {
      throw AppError.database(`Failed to fetch carousel slide by id: ${id}`, error);
    }
  }

  async create(data: CreateCarouselSlideInput): Promise<CarouselSlide> {
    try {
      return await this.prisma.carouselSlide.create({
        data: {
          title: data.title.trim(),
          subtitle: data.subtitle?.trim() || null,
          desktopImageUrl: data.desktopImageUrl.trim(),
          mobileImageUrl: data.mobileImageUrl?.trim() || null,
          targetUrl: data.targetUrl.trim(),
          badgeText: data.badgeText?.trim() || null,
          sortOrder: data.sortOrder ?? 0,
          isActive: data.isActive ?? true,
        },
      });
    } catch (error) {
      throw AppError.database('Failed to create carousel slide', error);
    }
  }

  async update(id: string, data: UpdateCarouselSlideInput): Promise<CarouselSlide> {
    try {
      return await this.prisma.carouselSlide.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title.trim() } : {}),
          ...(data.subtitle !== undefined ? { subtitle: data.subtitle?.trim() || null } : {}),
          ...(data.desktopImageUrl !== undefined ? { desktopImageUrl: data.desktopImageUrl.trim() } : {}),
          ...(data.mobileImageUrl !== undefined ? { mobileImageUrl: data.mobileImageUrl?.trim() || null } : {}),
          ...(data.targetUrl !== undefined ? { targetUrl: data.targetUrl.trim() } : {}),
          ...(data.badgeText !== undefined ? { badgeText: data.badgeText?.trim() || null } : {}),
          ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
          ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        },
      });
    } catch (error) {
      throw AppError.database(`Failed to update carousel slide: ${id}`, error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.carouselSlide.delete({
        where: { id },
      });
    } catch (error) {
      throw AppError.database(`Failed to delete carousel slide: ${id}`, error);
    }
  }

  async toggleActive(id: string): Promise<CarouselSlide> {
    try {
      const current = await this.findById(id);
      if (!current) {
        throw AppError.notFound(`Carousel slide not found: ${id}`);
      }
      return await this.prisma.carouselSlide.update({
        where: { id },
        data: { isActive: !current.isActive },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.database(`Failed to toggle carousel slide active status: ${id}`, error);
    }
  }

  async reorder(orderedIds: string[]): Promise<void> {
    try {
      await this.prisma.$transaction(
        orderedIds.map((id, index) =>
          this.prisma.carouselSlide.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );
    } catch (error) {
      throw AppError.database('Failed to reorder carousel slides', error);
    }
  }
}
