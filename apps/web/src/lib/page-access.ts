import { auth } from "@/auth";
import { redirect } from "next/navigation";

export type SessionUserContext = {
  id: string;
  role: "ADMIN" | "USER";
  email: string | null;
};

export async function requireUserContext(): Promise<SessionUserContext> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    role: session.user.role,
    email: session.user.email ?? null,
  };
}

export async function requireAdminContext(): Promise<SessionUserContext> {
  const user = await requireUserContext();

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}
