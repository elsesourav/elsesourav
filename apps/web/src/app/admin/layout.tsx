import { SignOutButton } from "@/app/admin/sign-out-button";
import { requireAdminContext } from "@/lib/page-access";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNav } from "./nav";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdminContext();

  return (
    <div className="min-h-screen bg-[radial-gradient(900px_380px_at_15%_-12%,rgba(31,94,212,0.16),transparent_68%),radial-gradient(900px_340px_at_85%_-10%,rgba(245,158,11,0.16),transparent_64%),#eef3fb] text-[#121927]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-300 items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-full border border-black/10 bg-[#f7f9ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1f5ed4]"
            >
              Admin Workspace
            </Link>
            <p className="mt-1 truncate text-sm font-semibold text-[#1b2438]">
              Signed in as {admin.email ?? "admin"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 sm:inline-block">
              {admin.role}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-300 gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:py-6">
        <aside className="lg:sticky lg:top-19.5 lg:h-[calc(100vh-110px)] lg:overflow-auto lg:pr-1">
          <AdminNav />
        </aside>

        <section className="min-w-0 rounded-3xl border border-black/10 bg-white/60 p-3 shadow-[0_20px_40px_-36px_rgba(20,23,31,0.75)] sm:p-4">
          {children}
        </section>
      </div>

      <footer className="border-t border-black/10 bg-white/70">
        <div className="mx-auto flex w-full max-w-300 flex-col justify-between gap-1 px-4 py-3 text-xs text-[#586177] sm:flex-row sm:items-center sm:px-6">
          <p>ElseSourav Admin Console</p>
          <p>Focused operations for catalog, users, content, and theme.</p>
        </div>
      </footer>
    </div>
  );
}
