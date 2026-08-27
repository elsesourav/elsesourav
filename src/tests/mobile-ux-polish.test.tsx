import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { nativeBridge } from '@/services/native-bridge.service';

describe('Final Mobile UX Polish & Cross-Platform Integrity (Prompt 84)', () => {
  describe('Task 2 & 10: Safe Area Tokens & Viewport Zoom Prevention', () => {
    it('defines standard CSS env() safe area insets in spacing tokens', () => {
      const spacingCssPath = path.resolve(process.cwd(), 'src/styles/tokens/spacing.css');
      const content = fs.readFileSync(spacingCssPath, 'utf8');

      expect(content).toContain('--safe-area-inset-top: env(safe-area-inset-top');
      expect(content).toContain('--safe-area-inset-bottom: env(safe-area-inset-bottom');
      expect(content).toContain('--safe-area-inset-left: env(safe-area-inset-left');
      expect(content).toContain('--safe-area-inset-right: env(safe-area-inset-right');
    });

    it('enforces 16px minimum font size on mobile inputs to prevent iOS Safari auto-zoom', () => {
      const resetCssPath = path.resolve(process.cwd(), 'src/styles/reset.css');
      const content = fs.readFileSync(resetCssPath, 'utf8');

      expect(content).toContain('@media screen and (max-width: 768px)');
      expect(content).toContain('font-size: 16px');
    });

    it('applies safe-area insets to top-level app-shell container', () => {
      const appLayoutCssPath = path.resolve(process.cwd(), 'src/layouts/AppLayout.css');
      const content = fs.readFileSync(appLayoutCssPath, 'utf8');

      expect(content).toContain('padding-top: max(0px, var(--safe-area-inset-top))');
      expect(content).toContain('padding-bottom: max(0px, var(--safe-area-inset-bottom))');
      expect(content).toContain('min-height: 100dvh');
    });
  });

  describe('Task 3 & 9: Mobile Touch Targets & Password Manager Autofill', () => {
    it('configures standard autoComplete attributes across auth pages', () => {
      const loginPath = path.resolve(process.cwd(), 'src/pages/LoginPage.tsx');
      const loginContent = fs.readFileSync(loginPath, 'utf8');
      expect(loginContent).toContain('autoComplete="email"');
      expect(loginContent).toContain('autoComplete="current-password"');

      const signupPath = path.resolve(process.cwd(), 'src/pages/SignUpPage.tsx');
      const signupContent = fs.readFileSync(signupPath, 'utf8');
      expect(signupContent).toContain('autoComplete="name"');
      expect(signupContent).toContain('autoComplete="email"');
      expect(signupContent).toContain('autoComplete="new-password"');

      const forgotPath = path.resolve(process.cwd(), 'src/pages/ForgotPasswordPage.tsx');
      const forgotContent = fs.readFileSync(forgotPath, 'utf8');
      expect(forgotContent).toContain('autoComplete="email"');
    });
  });

  describe('Task 12: Native App Lifecycle Listener', () => {
    it('gracefully handles lifecycle subscription without errors on web', () => {
      const cleanup = nativeBridge.initLifecycleListener((_isActive) => {
        // No-op for web mock
      });
      expect(typeof cleanup).toBe('function');
      cleanup();
    });
  });
});
