import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cache } from "react";

export type SessionUserContext = {
  id: string;
  role: "ADMIN" | "USER";
  email: string | null;
};

const getUserContext = cache(async (): Promise<SessionUserContext> => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    role: session.user.role,
    email: session.user.email ?? null,
  };
});

const getAdminContext = cache(async (): Promise<SessionUserContext> => {
  const user = await getUserContext();

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
});

export async function requireUserContext(): Promise<SessionUserContext> {
  return getUserContext();
}

export async function requireAdminContext(): Promise<SessionUserContext> {
  return getAdminContext();
}
