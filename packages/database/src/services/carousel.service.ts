import { CarouselRepository } from '../repositories/carousel.repository';
import { AppError } from '@elsesourav/types';
import type {
  CarouselSlide,
  CreateCarouselSlideInput,
  UpdateCarouselSlideInput,
  UserRole,
} from '@elsesourav/types';

export class CarouselService {
  constructor(private readonly carouselRepo: CarouselRepository) {}

  private verifyAdmin(callerRole?: UserRole | string): void {
    if (callerRole !== 'ADMIN' && callerRole !== 'STAFF') {
      throw AppError.forbidden('Administrative privileges are required to perform this action');
    }
  }

  async listActiveSlides(): Promise<CarouselSlide[]> {
    return this.carouselRepo.findAll({ activeOnly: true });
  }

  async listAdminSlides(callerRole?: UserRole | string): Promise<CarouselSlide[]> {
    this.verifyAdmin(callerRole);
    return this.carouselRepo.findAll();
  }

  async getSlideById(
    callerRole: UserRole | string | undefined,
    id: string
  ): Promise<CarouselSlide> {
    this.verifyAdmin(callerRole);
    if (!id || typeof id !== 'string') {
      throw AppError.validation('A valid slide ID is required');
    }
    const slide = await this.carouselRepo.findById(id);
    if (!slide) {
      throw AppError.notFound(`Carousel slide not found: ${id}`);
    }
    return slide;
  }

  async createSlide(
    callerRole: UserRole | string | undefined,
    data: CreateCarouselSlideInput
  ): Promise<CarouselSlide> {
    this.verifyAdmin(callerRole);
    if (!data.title || data.title.trim().length === 0) {
      throw AppError.validation('Slide title is required');
    }
    if (!data.desktopImageUrl || data.desktopImageUrl.trim().length === 0) {
      throw AppError.validation('Desktop banner image (21:9) is required');
    }
    if (!data.targetUrl || data.targetUrl.trim().length === 0) {
      throw AppError.validation('Destination target URL is required');
    }
    return this.carouselRepo.create(data);
  }

  async updateSlide(
    callerRole: UserRole | string | undefined,
    id: string,
    data: UpdateCarouselSlideInput
  ): Promise<CarouselSlide> {
    this.verifyAdmin(callerRole);
    if (!id || typeof id !== 'string') {
      throw AppError.validation('A valid slide ID is required');
    }
    const existing = await this.carouselRepo.findById(id);
    if (!existing) {
      throw AppError.notFound(`Carousel slide not found: ${id}`);
    }
    return this.carouselRepo.update(id, data);
  }

  async deleteSlide(
    callerRole: UserRole | string | undefined,
    id: string
  ): Promise<void> {
    this.verifyAdmin(callerRole);
    if (!id || typeof id !== 'string') {
      throw AppError.validation('A valid slide ID is required');
    }
    const existing = await this.carouselRepo.findById(id);
    if (!existing) {
      throw AppError.notFound(`Carousel slide not found: ${id}`);
    }
    await this.carouselRepo.delete(id);
  }

  async toggleActive(
    callerRole: UserRole | string | undefined,
    id: string
  ): Promise<CarouselSlide> {
    this.verifyAdmin(callerRole);
    if (!id || typeof id !== 'string') {
      throw AppError.validation('A valid slide ID is required');
    }
    return this.carouselRepo.toggleActive(id);
  }

  async reorderSlides(
    callerRole: UserRole | string | undefined,
    orderedIds: string[]
  ): Promise<void> {
    this.verifyAdmin(callerRole);
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw AppError.validation('An array of ordered slide IDs is required');
    }
    await this.carouselRepo.reorder(orderedIds);
  }
}
