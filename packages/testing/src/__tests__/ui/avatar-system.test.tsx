import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar, UserAvatar, getAvatarInitials, getDefaultAvatarUrl } from '@elsesourav/ui';

describe('Avatar & UserAvatar System', () => {
  describe('1. Initials Computation', () => {
    it('computes 2-letter initials for two-word display names', () => {
      expect(getAvatarInitials('Sourav Barui')).toBe('SB');
      expect(getAvatarInitials('John Doe')).toBe('JD');
    });

    it('computes 2-letter initials for single-word names', () => {
      expect(getAvatarInitials('Sourav')).toBe('SO');
      expect(getAvatarInitials('A')).toBe('A');
    });

    it('computes first and last initials for multi-word names', () => {
      expect(getAvatarInitials('Sourav Kumar Barui')).toBe('SB');
    });

    it('falls back to provided fallback or "U" for empty/null names', () => {
      expect(getAvatarInitials('')).toBe('U');
      expect(getAvatarInitials(null)).toBe('U');
      expect(getAvatarInitials(undefined, 'ES')).toBe('ES');
    });
  });

  describe('2. Deterministic Avatar Preset URL', () => {
    it('returns a stable deterministic SVG avatar URL for a given identifier', () => {
      const url1 = getDefaultAvatarUrl('user_123');
      const url2 = getDefaultAvatarUrl('user_123');
      expect(url1).toBe(url2);
      expect(url1).toMatch(/^\/avatars\/avatar-[1-6]\.svg$/);
    });

    it('returns default avatar-1.svg for null or empty identifiers', () => {
      expect(getDefaultAvatarUrl(null)).toBe('/avatars/avatar-1.svg');
      expect(getDefaultAvatarUrl('')).toBe('/avatars/avatar-1.svg');
    });
  });

  describe('3. Avatar Component Rendering & Determinism', () => {
    it('renders custom avatar image when src is provided', () => {
      render(
        <Avatar
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
          name="Sourav Barui"
          alt="Sourav Barui"
        />
      );
      const img = screen.getByRole('img', { name: 'Sourav Barui' });
      expect(img).toBeDefined();
    });

    it('renders deterministic initials fallback when src is absent', () => {
      render(<Avatar name="Sourav Barui" identifier="sourav@example.com" />);
      expect(screen.getByText('SB')).toBeDefined();
    });

    it('falls back seamlessly to initials when image fails to load (onError)', () => {
      const { container } = render(
        <Avatar
          src="https://invalid-broken-domain-404.test/missing.jpg"
          name="Jordan Taylor"
          alt="Jordan Taylor"
        />
      );

      const img = container.querySelector('img');
      expect(img).not.toBeNull();

      // Trigger image load error
      fireEvent.error(img!);

      // Image should be removed from DOM and initials displayed
      expect(screen.getByText('JT')).toBeDefined();
      expect(container.querySelector('img')).toBeNull();
    });

    it('renders status dot when showStatus is true', () => {
      const { container } = render(
        <Avatar name="Alex Rivers" showStatus={true} statusColor="emerald" />
      );
      const statusDot = container.querySelector('.bg-emerald-500');
      expect(statusDot).not.toBeNull();
    });

    it('supports alias UserAvatar export identically', () => {
      render(<UserAvatar name="Elena Rostova" identifier="elena@example.com" />);
      expect(screen.getByText('ER')).toBeDefined();
    });

    it('supports explicit fallback prop override', () => {
      render(<Avatar name="Sourav Barui" fallback="ES" />);
      expect(screen.getByText('ES')).toBeDefined();
    });
  });
});
