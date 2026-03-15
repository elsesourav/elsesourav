import { LinkCard, PageHeader, PageShell } from "@/components/ui/page";

const quickLinks = [
  { href: "/apps", title: "Browse apps" },
  { href: "/about", title: "About" },
  { href: "/admin", title: "Open admin" },
  { href: "/login", title: "Login" },
  { href: "/register", title: "Create account" },
] as const;

const apiLinks = [
  { href: "/api/health", title: "Health API" },
  { href: "/api/apps", title: "Catalog API" },
  { href: "/api/store/banners", title: "Banners API" },
  { href: "/api/auth/signin", title: "Auth sign-in" },
] as const;

export default function Home() {
  return (
    <PageShell center className="gap-10 py-14">
      <PageHeader
        eyebrow="ElseSourav Platform"
        title="Minimal microservice app store"
        description="Web BFF plus dedicated auth, catalog, user, content, and theme services using shared contracts."
      />

      <section className="grid gap-3 sm:grid-cols-2">
        {quickLinks.map((item) => (
          <LinkCard key={item.href} href={item.href} title={item.title} />
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {apiLinks.map((item) => (
          <LinkCard
            key={item.href}
            href={item.href}
            title={item.title}
            description={item.href}
          />
        ))}
      </section>
    </PageShell>
  );
}
