import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { CookiesPage } from '@/pages/CookiesPage';
import { AccessibilityPage } from '@/pages/AccessibilityPage';
import { Footer } from '@/layouts/Footer';

describe('Privacy & Legal Foundation (Prompt 67)', () => {
  describe('PrivacyPage (/privacy)', () => {
    it('renders privacy policy heading, sections, and transparent data descriptions', () => {
      render(
        <MemoryRouter>
          <PrivacyPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /1\. Introduction & Overview/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /2\. Information We Collect/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /3\. What We Do NOT Collect/i })).toBeInTheDocument();
      expect(screen.getByText(/We never sell, rent, or monetize your personal information/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Contact Support/i })).toBeInTheDocument();
    });
  });

  describe('TermsPage (/terms)', () => {
    it('renders terms of service heading, acceptable use, and disclaimer sections', () => {
      render(
        <MemoryRouter>
          <TermsPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /Terms of Service/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /1\. Acceptance of Terms/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /5\. Acceptable Use Policy/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /6\. Disclaimers & Limitation of Liability/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Privacy Policy/i })).toBeInTheDocument();
    });
  });

  describe('CookiesPage (/cookies)', () => {
    it('renders cookie and storage notice detailing localStorage and session usage', () => {
      render(
        <MemoryRouter>
          <CookiesPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /Cookie & Storage Notice/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /^theme$/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /^recent_searches$/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /^Firebase Auth Token$/i })).toBeInTheDocument();
      expect(screen.getByText(/No Advertising or Cross-Site Tracking/i)).toBeInTheDocument();
    });
  });

  describe('AccessibilityPage (/accessibility)', () => {
    it('renders accessibility statement, WCAG 2.2 AA alignment, and assistance path', () => {
      render(
        <MemoryRouter>
          <AccessibilityPage />
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { level: 1, name: /Accessibility Statement/i })).toBeInTheDocument();
      expect(screen.getByText(/Web Content Accessibility Guidelines \(WCAG\) 2\.2 Level AA/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Submit Accessibility Feedback/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Semantic Structure & Landmarks/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Full Keyboard Navigation/i })).toBeInTheDocument();
    });
  });

  describe('Global Footer Legal Links', () => {
    it('renders links to Privacy Policy, Terms of Service, Cookie Notice, and Accessibility', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );

      expect(screen.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute('href', '/privacy');
      expect(screen.getByRole('link', { name: /Terms of Service/i })).toHaveAttribute('href', '/terms');
      expect(screen.getByRole('link', { name: /Cookie Notice/i })).toHaveAttribute('href', '/cookies');
      expect(screen.getByRole('link', { name: /Accessibility/i })).toHaveAttribute('href', '/accessibility');
    });
  });
});
