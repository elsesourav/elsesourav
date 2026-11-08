import * as React from 'react';
import Image from 'next/image';
import { getBrandLogoVariant } from '@elsesourav/media';

export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  variant?: 'color' | 'theme' | 'white' | 'black';
  priority?: boolean;
  /** Optional dynamic brand/site name from database */
  name?: string;
  /** Optional dynamic brand icon/monogram URL from database */
  logoUrl?: string;
  /** Optional dynamic horizontal brand logo/wordmark URL from database */
  brandLogoUrl?: string;
}

export function BrandLogo({
  size = 'md',
  variant = 'color',
  priority = false,
  name,
  logoUrl,
  brandLogoUrl,
  className = '',
  ...props
}: BrandLogoProps) {
  // Sizing preserving ~6.2:1 aspect ratio (797x128) - compact on mobile, full on desktop
  const sizeClasses = {
    xs: 'h-[12px] sm:h-[14px] max-w-[80px]',
    sm: 'h-[13px] sm:h-[16px] max-w-[85px] sm:max-w-[100px]',
    md: 'h-[14px] sm:h-[19px] max-w-[90px] sm:max-w-[125px]',
    lg: 'h-[20px] sm:h-[24px] max-w-[130px] sm:max-w-[150px]',
    xl: 'h-[24px] sm:h-[28px] max-w-[150px] sm:max-w-[175px]',
    custom: '',
  }[size];

  const brandDisplayName = name || 'ElseSourav';

  // 1. If database provides a dedicated horizontal brand logo / wordmark
  if (brandLogoUrl) {
    const optimizedBrandUrl = getBrandLogoVariant(brandLogoUrl, {
      width: 400,
      height: 70,
    });

    return (
      <div
        className={`inline-flex items-center shrink-0 select-none group/logo ${className}`}
        {...props}
      >
        <div className={`relative ${sizeClasses} w-auto flex items-center shrink-0`}>
          <Image
            src={optimizedBrandUrl}
            alt={brandDisplayName}
            width={797}
            height={128}
            priority={priority}
            unoptimized
            style={{ width: 'auto', height: '100%', maxHeight: '100%' }}
            className="w-auto h-full object-contain group-hover/logo:scale-[1.02] transition-transform duration-200 ease-smooth"
          />
        </div>
        <span className="sr-only">{brandDisplayName}</span>
      </div>
    );
  }

  // 2. If database provides a brand icon/monogram logo and custom name
  if (logoUrl) {
    const iconVariantUrl = getBrandLogoVariant(logoUrl, {
      size: 64,
    });

    return (
      <div
        className={`inline-flex items-center gap-2 shrink-0 select-none group/logo ${className}`}
        {...props}
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
          <Image
            src={iconVariantUrl}
            alt={`${brandDisplayName} icon`}
            width={32}
            height={32}
            priority={priority}
            unoptimized
            className="w-full h-full object-contain group-hover/logo:scale-105 transition-transform duration-200"
          />
        </div>
        <span className="font-bold text-sm sm:text-base tracking-tight text-[hsl(var(--foreground))]">
          {brandDisplayName}
        </span>
      </div>
    );
  }

  // 3. Fallback: Default canonical vector brand wordmarks
  return (
    <div
      className={`inline-flex items-center shrink-0 select-none group/logo ${className}`}
      {...props}
    >
      <div className={`relative ${sizeClasses} w-auto flex items-center shrink-0`}>
        {variant === 'theme' ? (
          <>
            {/* Light mode: crisp solid black logo SVG */}
            <Image
              src="/brand-name-logo-black.svg"
              alt={brandDisplayName}
              width={797}
              height={128}
              priority={priority}
              unoptimized
              style={{ width: 'auto', height: '100%', maxHeight: '100%' }}
              className="w-auto h-full object-contain dark:hidden group-hover/logo:scale-[1.02] transition-transform duration-200 ease-smooth"
            />
            {/* Dark mode: crisp solid white logo SVG */}
            <Image
              src="/brand-name-logo-white.svg"
              alt={brandDisplayName}
              width={797}
              height={128}
              priority={priority}
              unoptimized
              style={{ width: 'auto', height: '100%', maxHeight: '100%' }}
              className="w-auto h-full object-contain hidden dark:block group-hover/logo:scale-[1.02] transition-transform duration-200 ease-smooth"
            />
          </>
        ) : variant === 'white' ? (
          <Image
            src="/brand-name-logo-white.svg"
            alt={brandDisplayName}
            width={797}
            height={128}
            priority={priority}
            unoptimized
            style={{ width: 'auto', height: '100%', maxHeight: '100%' }}
            className="w-auto h-full object-contain group-hover/logo:scale-[1.02] transition-transform duration-200 ease-smooth"
          />
        ) : variant === 'black' ? (
          <Image
            src="/brand-name-logo-black.svg"
            alt={brandDisplayName}
            width={797}
            height={128}
            priority={priority}
            unoptimized
            style={{ width: 'auto', height: '100%', maxHeight: '100%' }}
            className="w-auto h-full object-contain group-hover/logo:scale-[1.02] transition-transform duration-200 ease-smooth"
          />
        ) : (
          /* Full color SVG brand logo */
          <Image
            src="/brand-name-logo-color.svg"
            alt={brandDisplayName}
            width={797}
            height={128}
            priority={priority}
            unoptimized
            style={{ width: 'auto', height: '100%', maxHeight: '100%' }}
            className="w-auto h-full object-contain group-hover/logo:scale-[1.02] transition-transform duration-200 ease-smooth"
          />
        )}
      </div>
      <span className="sr-only">{brandDisplayName}</span>
    </div>
  );
}
