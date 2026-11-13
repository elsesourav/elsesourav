export interface CarouselSlide {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string | null;
  readonly desktopImageUrl: string;
  readonly mobileImageUrl?: string | null;
  readonly targetUrl: string;
  readonly badgeText?: string | null;
  readonly sortOrder: number;
  readonly isActive: boolean;
  readonly createdAt: Date | number | string;
  readonly updatedAt: Date | number | string;
}

export interface CreateCarouselSlideInput {
  readonly title: string;
  readonly subtitle?: string | null;
  readonly desktopImageUrl: string;
  readonly mobileImageUrl?: string | null;
  readonly targetUrl: string;
  readonly badgeText?: string | null;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}

export interface UpdateCarouselSlideInput {
  readonly title?: string;
  readonly subtitle?: string | null;
  readonly desktopImageUrl?: string;
  readonly mobileImageUrl?: string | null;
  readonly targetUrl?: string;
  readonly badgeText?: string | null;
  readonly sortOrder?: number;
  readonly isActive?: boolean;
}
