"use client";

import { PageHeader, PageShell } from "@/components/ui/page";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, ChevronRight, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default function ContactPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    
    // Simulate API fetch for smart suggestions
    const timer = setTimeout(() => {
      fetch(`/api/content/help/articles?search=${encodeURIComponent(query)}&limit=3`)
        .then(res => res.json())
        .then(data => {
          if (data.data?.items) {
            setSuggestions(data.data.items);
          }
        })
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <PageShell width="content" className="gap-8">
      <PageHeader
        eyebrow="Contact"
        title="How can we help?"
        description="Search our documentation or contact our support team."
      />

      <div className="max-w-2xl w-full mx-auto space-y-8">
        
        {/* Smart Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="What do you need help with? e.g., 'billing' or 'api access'"
              className="w-full pl-12 pr-4 py-4 text-lg bg-surface-elevated/50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {suggestions.length > 0 && (
            <div className="ui-card p-4 rounded-xl border bg-surface-base space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted px-2">Suggested Articles</h3>
              {suggestions.map(article => (
                <Link key={article.id} href={`/help/${article.slug}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-hover/50 transition-colors">
                  <span className="font-medium text-text-primary">{article.title}</span>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="text-center py-4">
          <span className="text-text-muted font-medium text-sm">OR</span>
        </div>

        {/* Contact Form */}
        <div className="ui-card p-6 sm:p-8 rounded-2xl border bg-surface-elevated/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-heading">Submit a request</h2>
              <p className="text-sm text-text-muted">We typically reply within 24 hours.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Email</label>
                <input type="email" className="w-full p-2 border rounded-lg bg-surface-base" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select className="w-full p-2 border rounded-lg bg-surface-base" required>
                  <option value="">Select a category...</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="technical">Technical Support</option>
                  <option value="account">Account Access</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea className="w-full p-3 border rounded-lg bg-surface-base min-h-[120px]" placeholder="Please describe your issue in detail..." required></textarea>
            </div>

            <Button type="submit" className="w-full py-6">Send Message</Button>
          </form>
        </div>

        {/* Static Cards */}
        <section className="grid gap-4 sm:grid-cols-2 pt-8 border-t">
          <Card className="space-y-2 bg-transparent shadow-none border-none">
            <CardTitle className="text-sm">Security reports</CardTitle>
            <CardDescription>security@elsesourav.dev</CardDescription>
          </Card>
          <Card className="space-y-2 bg-transparent shadow-none border-none">
            <CardTitle className="text-sm">Business inquiries</CardTitle>
            <CardDescription>business@elsesourav.dev</CardDescription>
          </Card>
        </section>

      </div>
    </PageShell>
  );
}
