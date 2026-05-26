import { Card } from "@/components/ui/card";
import { BookOpen, Box, CreditCard, Radio, MessageSquare } from "lucide-react";
import Link from "next/link";

export function HelpSupportPaths() {
  const paths = [
    {
      title: "Help Center",
      desc: "Guides and how-tos",
      icon: BookOpen,
      href: "/help",
    },
    {
      title: "App Support",
      desc: "Troubleshooting",
      icon: Box,
      href: "/help/apps",
    },
    {
      title: "Billing",
      desc: "Invoices & plans",
      icon: CreditCard,
      href: "/settings/billing",
    },
    {
      title: "Updates",
      desc: "Changelogs",
      icon: Radio,
      href: "/posts",
    },
    {
      title: "Contact",
      desc: "Direct support",
      icon: MessageSquare,
      href: "/contact",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {paths.map((path) => {
        const Icon = path.icon;
        return (
          <Link key={path.title} href={path.href}>
            <Card className="flex flex-col items-center text-center p-4 hover:border-brand-primary/50 transition-colors bg-bg-base cursor-pointer shadow-sm group">
              <div className="h-10 w-10 rounded-xl bg-surface-active flex items-center justify-center mb-3 group-hover:bg-brand-primary/10 transition-colors">
                <Icon className="h-5 w-5 text-text-muted group-hover:text-brand-primary transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">
                {path.title}
              </h3>
              <p className="text-xs text-text-muted mt-1">{path.desc}</p>
            </Card>
          </Link>
        );
      })}
    </section>
  );
}
