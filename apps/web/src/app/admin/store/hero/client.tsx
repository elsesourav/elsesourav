"use client";

import { ImageConfigGrid } from "@/components/admin/ImageConfigGrid";
import type { AdminImageConfig } from "@/lib/view-models";

export function AdminHomeHeroClient({
  initialConfigs,
}: {
  initialConfigs: AdminImageConfig[];
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-surface-base p-6 text-sm text-text-secondary">
        <p>
          The active image here will be used as the background for the Homepage Hero section.
          You can use the <strong>metadata</strong> field to dynamically control the Hero text.
        </p>
        <ul className="mt-2 list-disc pl-5 space-y-1">
          <li><strong>title:</strong> The main heading (e.g. &quot;Handcrafted digital experiences&quot;)</li>
          <li><strong>subtitle:</strong> The secondary text below the heading.</li>
        </ul>
      </div>

      <ImageConfigGrid
        initialConfigs={initialConfigs}
        section="HOME_HERO"
        title="Homepage Hero"
      />
    </div>
  );
}
