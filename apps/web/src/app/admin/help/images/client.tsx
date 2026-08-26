"use client";

import { ImageConfigGrid } from "@/components/admin/ImageConfigGrid";
import type { AdminImageConfig } from "@/lib/view-models";

export function AdminHelpImagesClient({
  initialConfigs,
}: {
  initialConfigs: AdminImageConfig[];
}) {
  return (
    <div className="max-w-6xl pb-24">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <ImageConfigGrid
            title="Help & Support Images"
            description="Manage background headers, banners, or spot illustrations used throughout the Help Center."
            section="HELP_SUPPORT"
            initialConfigs={initialConfigs}
          />
        </div>
      </div>
    </div>
  );
}
