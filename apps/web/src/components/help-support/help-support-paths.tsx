import AboutIcon from "@/components/icons/AboutIcon";
import AppsIcon from "@/components/icons/AppsIcon";
import BlogIcon from "@/components/icons/BlogIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import HelpAndSupportIcon from "@/components/icons/HelpAndSupportIcon";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function HelpSupportPaths() {
  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="space-y-3 text-sm ui-text-primary">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-secondary)_12%,white_88%)]">
              <HelpAndSupportIcon className="h-5 w-5 fill-[#1f5ed4]" />
            </span>
            <div>
              <CardTitle>Help Center</CardTitle>
              <CardDescription>
                Guides, how-tos, and release notes.
              </CardDescription>
            </div>
          </div>
          <Link
            href="/help"
            className="text-sm font-semibold text-[#1f5ed4] underline decoration-black/20 underline-offset-4"
          >
            Browse help articles
          </Link>
        </Card>
        <Card className="space-y-3 text-sm ui-text-primary">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-secondary)_12%,white_88%)]">
              <AppsIcon className="h-5 w-5 fill-[#1f5ed4]" />
            </span>
            <div>
              <CardTitle>App Support</CardTitle>
              <CardDescription>
                Install, configure, and troubleshoot apps.
              </CardDescription>
            </div>
          </div>
          <p className="text-sm text-[#556171]">
            Response target: within 24-48 hours.
          </p>
        </Card>
        <Card className="space-y-3 text-sm ui-text-primary">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-secondary)_12%,white_88%)]">
              <DashboardIcon className="h-5 w-5 fill-[#1f5ed4]" />
            </span>
            <div>
              <CardTitle>Billing & Account</CardTitle>
              <CardDescription>
                Invoices, refunds, and plan changes.
              </CardDescription>
            </div>
          </div>
          <p className="text-sm text-[#556171]">
            Response target: within 2 business days.
          </p>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Card className="space-y-3 text-sm ui-text-primary">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-secondary)_12%,white_88%)]">
              <BlogIcon className="h-5 w-5 fill-[#1f5ed4]" />
            </span>
            <div>
              <CardTitle>Product Updates</CardTitle>
              <CardDescription>
                News, changelogs, and launch notes.
              </CardDescription>
            </div>
          </div>
          <Link
            href="/blog"
            className="text-sm font-semibold text-[#1f5ed4] underline decoration-black/20 underline-offset-4"
          >
            Read the blog
          </Link>
        </Card>
        <Card className="space-y-3 text-sm ui-text-primary">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-secondary)_12%,white_88%)]">
              <AboutIcon className="h-5 w-5 fill-[#1f5ed4]" />
            </span>
            <div>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Send a direct request to the team.
              </CardDescription>
            </div>
          </div>
          <Link
            href="/contact"
            className="text-sm font-semibold text-[#1f5ed4] underline decoration-black/20 underline-offset-4"
          >
            Open contact page
          </Link>
        </Card>
      </section>
    </>
  );
}
