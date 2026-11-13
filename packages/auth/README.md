# @elsesourav/auth — Authentication & Identity Library

The official authentication and identity library powering the **ElseSourav** ecosystem. Built on top of **Supabase Auth** (`@supabase/ssr` and `@supabase/supabase-js`) and tightly integrated with **Prisma ORM** for PostgreSQL user synchronization.

---

## Features

- **Multi-Provider Support**: Google OAuth, GitHub OAuth, and Email / Password authentication.
- **Username as Login Identifier**: Allows users to log in using either their `@username` or their registered email address.
- **Dual-Tier Client Architecture**:
  - `createAuthBrowserClient`: Optimized browser-side client with PKCE flow and pre-flight provider verification.
  - `createAuthServerClient`: Cookie-aware SSR client for Next.js Server Components, Server Actions, and Route Handlers.
  - `createAuthAdminClient`: Elevated server-only service-role client for background administration and user creation.
- **Session & Role Guards**: Safe server session extraction (`getServerSession`), authenticated route protection (`requireAuth`), and role-based access control (`requireRole`).
- **Cross-Domain SSO Ready**: Configurable cookie options for wildcard subdomain sharing (`.elsesourav.com`).
- **Open-Redirect Hardening**: Robust URL sanitization utility (`sanitizeRedirectUrl`) preventing open-redirect phishing attacks.

---

## Installation & Monorepo Import

Within the ElseSourav Turborepo monorepo, import directly:

```typescript
import {
  createAuthBrowserClient,
  createAuthServerClient,
  getServerSession,
  requireAuth,
  requireRole,
  signInWithOAuth,
  sanitizeRedirectUrl,
  AuthError,
  type AuthenticatedUser,
  type AuthSession,
  type UserRole,
} from '@elsesourav/auth';
```

---

## Environment Variables

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client & Server | Your Supabase project URL (`https://<project-id>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client & Server | Supabase anonymous public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Private / Server Only | Secret service role key with elevated administrative permissions |
| `ADMIN_EMAIL` | Private / Server Only | Primary administrator email address for elevated role elevation |
| `NEXT_PUBLIC_SITE_URL` | Public / Client & Server | Canonical public origin (e.g. `https://elsesourav.com`) |

---

## Client-Side Usage (Browser / React)

### 1. Browser Client Initialization

```typescript
import { createAuthBrowserClient } from '@elsesourav/auth';

const supabase = createAuthBrowserClient();
```

### 2. Sign In with Email & Password

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securePassword123!',
});

if (error) {
  console.error('Sign-in failed:', error.message);
} else {
  console.log('Logged in user:', data.user);
}
```

### 3. Sign In with OAuth (Google / GitHub)

```typescript
import { createAuthBrowserClient, signInWithOAuth } from '@elsesourav/auth';

const supabase = createAuthBrowserClient();

// Triggers OAuth redirect with preflight check and safe redirect URL
const { url, error } = await signInWithOAuth(supabase, {
  provider: 'google', // or 'github'
  redirectTo: '/account',
});

if (error) {
  alert(error.message);
} else if (url) {
  window.location.href = url;
}
```

---

## Server-Side Usage (Next.js Server Components & Route Handlers)

### 1. Retrieve Current Session

```typescript
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div>
      <h1>Welcome back, {session.user.displayName}!</h1>
      <p>Role: {session.user.role}</p>
      <p>Email: {session.user.email}</p>
    </div>
  );
}
```

### 2. Enforce Authentication (`requireAuth`)

Throws an `AppError.unauthorized` if no valid session is present:

```typescript
import { cookies } from 'next/headers';
import { requireAuth } from '@elsesourav/auth';

export async function POST() {
  const cookieStore = await cookies();
  const user = await requireAuth({
    getAll: () => cookieStore.getAll(),
  });

  // User is guaranteed to be authenticated
  console.log('Authenticated action by:', user.id);
}
```

### 3. Enforce Role Privileges (`requireRole`)

Guards admin or staff endpoints:

```typescript
import { cookies } from 'next/headers';
import { requireRole } from '@elsesourav/auth';

export async function GET() {
  const cookieStore = await cookies();
  const adminUser = await requireRole(
    { getAll: () => cookieStore.getAll() },
    ['ADMIN', 'STAFF']
  );

  // Caller is guaranteed to be ADMIN or STAFF
  return Response.json({ success: true, admin: adminUser.displayName });
}
```

---

## User Data Synchronization

When a user signs in via OAuth or email, their Supabase Auth record is automatically synchronized with the PostgreSQL database `User` table:

1. **OAuth Callback**: Handled in `/api/auth/callback`, capturing avatar URLs, display names, and normalized usernames.
2. **Email Login / Sign Up**: Synchronized through `/api/auth/sync`, upserting the user into Prisma `User` with default preferences and library relations.
3. **Database Model**: Stored in PostgreSQL with unique `supabaseAuthId`, `email`, and `username` constraints.

---

## Single Sign-On (SSO) & Multi-App Integration

For integrating this authentication system into external applications, WebGL games, Godot, Unity, or other platforms under the ElseSourav account, refer to the master specification:

👉 **[`docs/AUTHENTICATION.md`](../../docs/AUTHENTICATION.md)**
