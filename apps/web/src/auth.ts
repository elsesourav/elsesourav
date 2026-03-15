import { fetchServiceData } from "@/lib/service-client";
import { getServerEnv } from "@elsesourav/config";
import { credentialsSchema } from "@elsesourav/validation";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";

type AppRole = "ADMIN" | "USER";

type AuthServiceUser = {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
  role: AppRole;
};

type AuthServiceLoginResponse = {
  token: string;
  user: AuthServiceUser;
};

type AuthServiceSessionUser = {
  id: string;
  email: string;
  role: AppRole;
};

function isAppRole(value: unknown): value is AppRole {
  return value === "ADMIN" || value === "USER";
}

const env = getServerEnv();
const authSecret =
  env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === "development"
    ? "dev-only-secret-change-this-before-production"
    : undefined);

if (!authSecret) {
  throw new Error("NEXTAUTH_SECRET is required outside development mode.");
}

const githubProviders =
  env.GITHUB_ID && env.GITHUB_SECRET
    ? [
        GitHub({
          clientId: env.GITHUB_ID,
          clientSecret: env.GITHUB_SECRET,
        }),
      ]
    : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  secret: authSecret,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        try {
          const payload = await fetchServiceData<AuthServiceLoginResponse>({
            service: "auth",
            path: "/v1/auth/login",
            method: "POST",
            body: parsed.data,
          });

          return {
            id: payload.user.id,
            email: payload.user.email,
            name: payload.user.name,
            role: payload.user.role,
          };
        } catch {
          return null;
        }
      },
    }),
    ...githubProviders,
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === "github" && user.email) {
        try {
          const syncedUser = await fetchServiceData<AuthServiceUser>({
            service: "auth",
            path: "/v1/auth/oauth/github/upsert",
            method: "POST",
            body: {
              email: user.email,
              name: user.name,
              image: user.image,
            },
          });

          user.id = syncedUser.id;
          user.name = syncedUser.name ?? user.name;
          user.image = syncedUser.image ?? user.image;
          (user as { role?: AppRole }).role = syncedUser.role;
        } catch {
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (typeof user?.id === "string") {
        token.id = user.id;
      }

      const role = (user as { role?: unknown } | undefined)?.role;
      if (isAppRole(role)) {
        token.role = role;
      }

      const now = Date.now();
      const shouldSyncRole =
        typeof token.id === "string" &&
        (typeof token.roleSyncAt !== "number" ||
          now - token.roleSyncAt > 5 * 60 * 1000);

      if (shouldSyncRole) {
        try {
          const dbUser = await fetchServiceData<AuthServiceSessionUser>({
            service: "auth",
            path: `/v1/auth/users/${token.id}`,
          });

          token.id = dbUser.id;
          token.role = dbUser.role;
          token.roleSyncAt = now;
        } catch {
          token.roleSyncAt = now;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      session.user.id = typeof token.id === "string" ? token.id : "";
      session.user.role =
        token.role === "ADMIN" || token.role === "USER" ? token.role : "USER";
      return session;
    },
  },
});
