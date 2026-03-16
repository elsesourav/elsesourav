"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  dismissNotification,
  selectNotifications,
  type NotificationItem,
} from "@/store/slices/notificationsSlice";
import { createAppStore, type AppStore } from "@/store/store";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";

type AppProvidersProps = {
  children: React.ReactNode;
};

function NotificationToast({ item }: { item: NotificationItem }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      dispatch(dismissNotification(item.id));
    }, item.durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dispatch, item.durationMs, item.id]);

  const toneClassName =
    item.tone === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : item.tone === "error"
        ? "border-rose-300 bg-rose-50 text-rose-900"
        : "border-sky-300 bg-sky-50 text-sky-900";

  return (
    <article
      className={`pointer-events-auto rounded-xl border px-3 py-2 text-sm shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)] ${toneClassName}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="leading-6">{item.message}</p>
        <button
          type="button"
          onClick={() => dispatch(dismissNotification(item.id))}
          className="rounded-full border border-black/20 bg-white px-2 py-0.5 text-xs text-[#131924]"
          aria-label="Dismiss notification"
        >
          Dismiss
        </button>
      </div>
    </article>
  );
}

function NotificationViewport() {
  const items = useAppSelector(selectNotifications);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      {items.map((item) => (
        <NotificationToast key={item.id} item={item} />
      ))}
    </div>
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  const [store] = useState<AppStore>(() => createAppStore());

  return (
    <Provider store={store}>
      {children}
      <NotificationViewport />
    </Provider>
  );
}
