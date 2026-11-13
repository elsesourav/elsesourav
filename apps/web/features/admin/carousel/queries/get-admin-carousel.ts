import { CarouselRepository, CarouselService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import type { CarouselSlide } from '@elsesourav/types';

const carouselRepo = new CarouselRepository();
const carouselService = new CarouselService(carouselRepo);

export async function getAdminCarouselSlides(): Promise<CarouselSlide[]> {
  const context = await requireAdmin();
  return carouselService.listAdminSlides(context.role);
}

export async function getAdminCarouselSlideById(id: string): Promise<CarouselSlide> {
  const context = await requireAdmin();
  return carouselService.getSlideById(context.role, id);
}

export async function getPublicCarouselSlides(): Promise<CarouselSlide[]> {
  return carouselService.listActiveSlides();
}
