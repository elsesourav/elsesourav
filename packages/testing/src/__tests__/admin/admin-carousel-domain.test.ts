import { describe, it, expect, vi } from 'vitest';
import { CarouselService, CarouselRepository } from '@elsesourav/database';
import { AdminSaveCarouselSlideSchema } from '@elsesourav/validation';
import type { CarouselSlide } from '@elsesourav/types';

describe('Admin Carousel Domain & Security Boundary', () => {
  const mockSlide: CarouselSlide = {
    id: 'slide-glorov-1',
    title: 'GLOROV Botanical E-Commerce Monorepo',
    subtitle: 'Indian agricultural nursery platform with Medusa v2',
    desktopImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2100&q=80',
    mobileImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
    targetUrl: '/apps/glorov',
    badgeText: 'OFFICIAL LAUNCH',
    sortOrder: 0,
    isActive: true,
    createdAt: new Date('2026-11-13T10:00:00Z'),
    updatedAt: new Date('2026-11-13T10:00:00Z'),
  };

  // ==========================================
  // Public Access
  // ==========================================

  it('allows public access to listActiveSlides without authentication', async () => {
    const mockRepo = {
      findAll: vi.fn().mockResolvedValue([mockSlide]),
    } as unknown as CarouselRepository;

    const service = new CarouselService(mockRepo);
    const slides = await service.listActiveSlides();

    expect(slides).toHaveLength(1);
    expect(slides[0]?.id).toBe('slide-glorov-1');
    expect(mockRepo.findAll).toHaveBeenCalledWith({ activeOnly: true });
  });

  // ==========================================
  // Role-Based Authorization
  // ==========================================

  it('allows ADMIN to list all admin slides', async () => {
    const mockRepo = {
      findAll: vi.fn().mockResolvedValue([mockSlide]),
    } as unknown as CarouselRepository;

    const service = new CarouselService(mockRepo);
    const slides = await service.listAdminSlides('ADMIN');

    expect(slides).toHaveLength(1);
    expect(mockRepo.findAll).toHaveBeenCalledWith();
  });

  it('allows STAFF to list all admin slides', async () => {
    const mockRepo = {
      findAll: vi.fn().mockResolvedValue([mockSlide]),
    } as unknown as CarouselRepository;

    const service = new CarouselService(mockRepo);
    const slides = await service.listAdminSlides('STAFF');

    expect(slides).toHaveLength(1);
  });

  it('rejects USER from listing admin slides', async () => {
    const mockRepo = {
      findAll: vi.fn(),
    } as unknown as CarouselRepository;

    const service = new CarouselService(mockRepo);
    await expect(service.listAdminSlides('USER')).rejects.toThrow(
      'Administrative privileges are required'
    );
  });

  it('rejects undefined/GUEST role from listing admin slides', async () => {
    const mockRepo = {
      findAll: vi.fn(),
    } as unknown as CarouselRepository;

    const service = new CarouselService(mockRepo);
    await expect(service.listAdminSlides()).rejects.toThrow(
      'Administrative privileges are required'
    );
  });

  // ==========================================
  // CRUD Operations
  // ==========================================

  it('allows ADMIN to create a new carousel slide', async () => {
    const mockRepo = {
      create: vi.fn().mockResolvedValue(mockSlide),
    } as unknown as CarouselRepository;

    const service = new CarouselService(mockRepo);
    const created = await service.createSlide('ADMIN', {
      title: 'GLOROV Botanical E-Commerce Monorepo',
      desktopImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=2100&q=80',
      targetUrl: '/apps/glorov',
      sortOrder: 0,
      isActive: true,
    });

    expect(created.id).toBe('slide-glorov-1');
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'GLOROV Botanical E-Commerce Monorepo',
        targetUrl: '/apps/glorov',
      })
    );
  });

  it('rejects USER from creating a carousel slide', async () => {
    const mockRepo = {
      create: vi.fn(),
    } as unknown as CarouselRepository;

    const service = new CarouselService(mockRepo);
    await expect(
      service.createSlide('USER', {
        title: 'Unauthorized slide',
        desktopImageUrl: 'https://example.com/banner.png',
        targetUrl: '/apps/test',
      })
    ).rejects.toThrow('Administrative privileges are required');
  });

  it('allows ADMIN to update a carousel slide', async () => {
    const updatedSlide = { ...mockSlide, title: 'Updated Title' };
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(mockSlide),
      update: vi.fn().mockResolvedValue(updatedSlide),
    } as unknown as CarouselRepository;

    const service = new CarouselService(mockRepo);
    const updated = await service.updateSlide('ADMIN', 'slide-glorov-1', {
      title: 'Updated Title',
    });

    expect(updated.title).toBe('Updated Title');
    expect(mockRepo.findById).toHaveBeenCalledWith('slide-glorov-1');
    expect(mockRepo.update).toHaveBeenCalledWith('slide-glorov-1', {
      title: 'Updated Title',
    });
  });

  it('allows ADMIN to delete a carousel slide', async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(mockSlide),
      delete: vi.fn().mockResolvedValue(undefined),
    } as unknown as CarouselRepository;

    const service = new CarouselService(mockRepo);
    await service.deleteSlide('ADMIN', 'slide-glorov-1');

    expect(mockRepo.findById).toHaveBeenCalledWith('slide-glorov-1');
    expect(mockRepo.delete).toHaveBeenCalledWith('slide-glorov-1');
  });

  it('allows ADMIN to toggle slide active state', async () => {
    const toggledSlide = { ...mockSlide, isActive: false };
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(mockSlide),
      toggleActive: vi.fn().mockResolvedValue(toggledSlide),
    } as unknown as CarouselRepository;

    const service = new CarouselService(mockRepo);
    const toggled = await service.toggleActive('ADMIN', 'slide-glorov-1');

    expect(toggled.isActive).toBe(false);
    expect(mockRepo.toggleActive).toHaveBeenCalledWith('slide-glorov-1');
  });

  it('allows ADMIN to reorder slides', async () => {
    const mockRepo = {
      reorder: vi.fn().mockResolvedValue(undefined),
    } as unknown as CarouselRepository;

    const service = new CarouselService(mockRepo);
    await service.reorderSlides('ADMIN', ['slide-2', 'slide-1']);

    expect(mockRepo.reorder).toHaveBeenCalledWith(['slide-2', 'slide-1']);
  });

  // ==========================================
  // Validation Schema
  // ==========================================

  it('validates valid carousel slide input schema', () => {
    const valid = {
      title: 'GLOROV Launch',
      desktopImageUrl: 'https://cdn.example.com/banner-21-9.jpg',
      targetUrl: '/apps/glorov',
      sortOrder: 0,
      isActive: true,
      badgeText: 'LAUNCH',
    };

    const parsed = AdminSaveCarouselSlideSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects schema when required desktopImageUrl is missing or invalid', () => {
    const invalid = {
      title: 'GLOROV Launch',
      desktopImageUrl: 'invalid-url',
      targetUrl: '/apps/glorov',
    };

    const parsed = AdminSaveCarouselSlideSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('rejects schema when required title is empty', () => {
    const invalid = {
      title: '',
      desktopImageUrl: 'https://cdn.example.com/banner-21-9.jpg',
      targetUrl: '/apps/glorov',
    };

    const parsed = AdminSaveCarouselSlideSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});
