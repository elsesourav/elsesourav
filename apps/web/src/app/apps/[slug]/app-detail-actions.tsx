"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAppSaved, toggleAppSaved } from "@/store/slices/librarySlice";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import { addRecentApp } from "@/store/slices/recentAppsSlice";
import { useEffect } from "react";

type AppDetailActionsProps = {
  appId: string;
  slug: string;
  title: string;
};

export function AppDetailActions({
  appId,
  slug,
  title,
}: AppDetailActionsProps) {
  const dispatch = useAppDispatch();
  const isSaved = useAppSelector((state) => selectIsAppSaved(state, appId));

  useEffect(() => {
    dispatch(addRecentApp({ appId, slug, title }));
  }, [appId, dispatch, slug, title]);

  function onToggleQuickSave() {
    dispatch(toggleAppSaved(appId));
    dispatch(
      enqueueNotification({
        tone: isSaved ? "info" : "success",
        message: isSaved
          ? `${title} removed from your quick library.`
          : `${title} saved to your quick library.`,
      }),
    );
  }

  return (
    <section className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
      <button
        type="button"
        onClick={onToggleQuickSave}
        className="rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-medium text-[#14171f] transition hover:bg-[#f7f8fb]"
      >
        {isSaved ? "Remove from quick library" : "Save to quick library"}
      </button>
      <p className="mt-2 text-xs text-[#4a5262]">
        This action updates client UX state only. Server app details remain API
        sourced.
      </p>
    </section>
  );
}
