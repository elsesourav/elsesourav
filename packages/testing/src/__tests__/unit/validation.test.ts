import { describe, it, expect } from 'vitest';
import {
  SignInSchema,
  SignUpSchema,
  AppSchema,
  BlogPostSchema,
  SupportTicketSchema,
  HelpArticleSchema,
  UserProfileSchema,
  UsernameSchema,
  UniversalLoginSchema,
} from '@elsesourav/validation';

describe('Validation Schemas Contract Test', () => {
  it('validates SignIn credentials correctly', () => {
    const valid = { email: 'user@elsesourav.com', password: 'securepassword123' };
    const invalid = { email: 'invalid-email', password: 'short' };

    expect(SignInSchema.safeParse(valid).success).toBe(true);
    expect(SignInSchema.safeParse(invalid).success).toBe(false);
  });

  it('validates SignUp credentials correctly', () => {
    const valid = {
      email: 'user@elsesourav.com',
      password: 'securepassword123',
      displayName: 'Sourav',
      username: 'sourav_dev',
    };
    expect(SignUpSchema.safeParse(valid).success).toBe(true);
  });

  it('validates App schema contracts', () => {
    const validApp = {
      name: 'Terminal Pro',
      slug: 'terminal-pro',
      shortDescription: 'Hardware accelerated terminal emulator',
      description: 'Full featured web terminal emulator with low latency rendering.',
      iconUrl: 'https://elsesourav.com/icon.png',
      primaryCategory: 'dev-tools',
      platforms: ['web', 'macos'],
    };

    expect(AppSchema.safeParse(validApp).success).toBe(true);
  });

  it('validates BlogPost schema contracts', () => {
    const validPost = {
      title: 'Modern Architecture in 2026',
      slug: 'modern-architecture-2026',
      excerpt: 'A deep exploration into Turborepo and Next.js 15 App Router architecture.',
      content:
        'Detailed breakdown of system architecture and performance characteristics in web software.',
      category: 'architecture',
    };

    expect(BlogPostSchema.safeParse(validPost).success).toBe(true);
  });

  it('validates SupportTicket schema contracts', () => {
    const validTicket = {
      subject: 'Issue with terminal emulator rendering',
      description: 'When running htop on macOS Safari, the screen flickers intermittently.',
      category: 'bug_report',
    };

    expect(SupportTicketSchema.safeParse(validTicket).success).toBe(true);
  });

  it('validates HelpArticle schema contracts', () => {
    const validArticle = {
      categoryId: 'getting-started',
      title: 'Installing the Terminal CLI',
      slug: 'installing-terminal-cli',
      content: 'Run the following command in your terminal: brew install elsesourav-cli',
    };

    expect(HelpArticleSchema.safeParse(validArticle).success).toBe(true);
  });

  it('validates UserProfile schema contracts', () => {
    const validProfile = {
      displayName: 'Sourav',
      username: 'elsesourav',
      bio: 'Software engineer building web developer platforms.',
    };

    expect(UserProfileSchema.safeParse(validProfile).success).toBe(true);
  });

  it('validates minimum 4 characters for username', () => {
    expect(UsernameSchema.safeParse('sou').success).toBe(false);
    expect(UsernameSchema.safeParse('sour').success).toBe(true);
    expect(UsernameSchema.safeParse('valid_user-1').success).toBe(true);
    expect(UsernameSchema.safeParse('admin').success).toBe(false); // reserved
  });

  it('validates UniversalLoginSchema with email or username', () => {
    expect(
      UniversalLoginSchema.safeParse({ identifier: 'user@example.com', password: 'password123' })
        .success
    ).toBe(true);
    expect(
      UniversalLoginSchema.safeParse({ identifier: 'elsesourav', password: 'password123' }).success
    ).toBe(true);
    expect(
      UniversalLoginSchema.safeParse({ identifier: 'usr', password: 'password123' }).success
    ).toBe(false);
  });
});
