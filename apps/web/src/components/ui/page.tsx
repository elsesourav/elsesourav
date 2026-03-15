import Link from "next/link";
import type { ReactNode } from "react";

type Align = "left" | "center";
type PageShellWidth = "narrow" | "content" | "wide";

const shellWidthClass: Record<PageShellWidth, string> = {
  narrow: "max-w-md",
  content: "max-w-4xl",
  wide: "max-w-5xl",
};

function cn(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PageShell({
  children,
  width = "content",
  center = false,
  className,
}: {
  children: ReactNode;
  width?: PageShellWidth;
  center?: boolean;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full flex-col gap-8 px-6 py-12 text-[#14171f] sm:px-10",
        shellWidthClass[width],
        center && "min-h-screen justify-center",
        className,
      )}
    >
      {children}
    </main>
  );
}

export function PageHeader({
  title,
  eyebrow,
  description,
  align = "left",
  actions,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  align?: Align;
  actions?: ReactNode;
}) {
  const textAlign = align === "center" ? "text-center" : "text-left";

  return (
    <header
      className={cn(
        "space-y-2",
        Boolean(actions) &&
          align === "left" &&
          "flex items-start justify-between gap-4",
      )}
    >
      <div className={textAlign}>
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.2em] text-[#4a5262]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-[#0e1118] sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-[#3f4757]">{description}</p>
        ) : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </header>
  );
}

export function LinkCard({
  href,
  title,
  description,
  className,
}: {
  href: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl border border-black/10 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)] transition hover:border-black/20 hover:bg-[#fcfcfe]",
        className,
      )}
    >
      <p className="text-sm font-semibold text-[#121722]">{title}</p>
      {description ? (
        <p className="mt-1 text-xs text-[#495160]">{description}</p>
      ) : null}
    </Link>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <article className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
      <p className="text-xs uppercase tracking-wide text-[#4a5262]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#0f131d]">{value}</p>
    </article>
  );
}
