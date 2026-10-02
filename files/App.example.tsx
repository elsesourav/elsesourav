import { useState } from "react";
import { AppCard, ExploreApps, sampleApps, type AppItem } from "./index";

export default function Demo() {
  const [apps, setApps] = useState<AppItem[]>(sampleApps);

  // 1) Full "Explore Apps" section (responsive: list on phones, grid on larger screens)
  // 2) A standalone, customised AppCard
  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6">
      <ExploreApps
        apps={apps}
        onSelectApp={(app) => console.log("open", app.name)}
        cardProps={{
          showCategory: false,
          onRate: (app, value) =>
            setApps((prev) => prev.map((a) => (a.id === app.id ? { ...a, rating: value } : a))),
        }}
      />

      <div className="max-w-xs">
        <AppCard
          app={sampleApps[0]}
          variant="banner"
          ratingStyle="compact"
          descriptionLines={2}
          maxPlatforms={1}
          animate={false}
          classNames={{ root: "rounded-3xl", title: "text-lg" }}
          renderAction={() => (
            <button className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700 active:scale-95">
              Get
            </button>
          )}
        />
      </div>
    </div>
  );
}
