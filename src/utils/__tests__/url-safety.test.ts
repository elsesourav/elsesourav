import { describe, it, expect } from 'vitest';
import { isSafeUrl, isSafeExternalUrl, isSafeImageUrl } from '../url-safety';

describe('url-safety utilities', () => {
  describe('isSafeUrl', () => {
    it('allows valid HTTPS, HTTP, relative, mailto, tel, and anchor URLs', () => {
      expect(isSafeUrl('https://elsesourav.com')).toBe(true);
      expect(isSafeUrl('http://localhost:5173')).toBe(true);
      expect(isSafeUrl('/apps/codeflow')).toBe(true);
      expect(isSafeUrl('#section-1')).toBe(true);
      expect(isSafeUrl('mailto:support@elsesourav.com')).toBe(true);
      expect(isSafeUrl('tel:+1234567890')).toBe(true);
    });

    it('rejects unsafe protocols and control characters', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('JAVASCRIPT:void(0)')).toBe(false);
      expect(isSafeUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeUrl('file:///etc/passwd')).toBe(false);
      expect(isSafeUrl('https://elsesourav.com/\x00evil')).toBe(false);
      expect(isSafeUrl('')).toBe(false);
      expect(isSafeUrl(null)).toBe(false);
      expect(isSafeUrl(undefined)).toBe(false);
    });
  });

  describe('isSafeExternalUrl', () => {
    it('allows valid absolute http/https URLs', () => {
      expect(isSafeExternalUrl('https://github.com/elsesourav')).toBe(true);
      expect(isSafeExternalUrl('http://example.com')).toBe(true);
    });

    it('rejects relative URLs and malformed strings', () => {
      expect(isSafeExternalUrl('/apps/codeflow')).toBe(false);
      expect(isSafeExternalUrl('not a url')).toBe(false);
      expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    });
  });

  describe('isSafeImageUrl', () => {
    it('allows HTTPS, HTTP, and relative paths for images', () => {
      expect(isSafeImageUrl('https://cdn.elsesourav.com/icons/app.png')).toBe(true);
      expect(isSafeImageUrl('http://localhost:5173/favicon.svg')).toBe(true);
      expect(isSafeImageUrl('/favicon.svg')).toBe(true);
    });

    it('strictly rejects malicious schemes, data schemes, and file schemes for images', () => {
      expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeImageUrl('data:image/svg+xml;base64,PHN2Zz4=')).toBe(false);
      expect(isSafeImageUrl('vbscript:evil')).toBe(false);
      expect(isSafeImageUrl('file:///Users/sourav/secret.png')).toBe(false);
      expect(isSafeImageUrl('')).toBe(false);
      expect(isSafeImageUrl(null)).toBe(false);
      expect(isSafeImageUrl(undefined)).toBe(false);
    });
  });
});
