import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

const MAX_RECENT_APPS = 12;

export type RecentApp = {
  appId: string;
  slug: string;
  title: string;
  viewedAt: string;
};

type RecentAppsState = {
  items: RecentApp[];
};

const initialState: RecentAppsState = {
  items: [],
};

const recentAppsSlice = createSlice({
  name: "recentApps",
  initialState,
  reducers: {
    addRecentApp(
      state,
      action: PayloadAction<{
        appId: string;
        slug: string;
        title: string;
      }>,
    ) {
      const { appId, slug, title } = action.payload;
      const viewedAt = new Date().toISOString();

      state.items = [
        { appId, slug, title, viewedAt },
        ...state.items.filter((item) => item.appId !== appId),
      ].slice(0, MAX_RECENT_APPS);
    },
    clearRecentApps(state) {
      state.items = [];
    },
  },
});

export const { addRecentApp, clearRecentApps } = recentAppsSlice.actions;

export const selectRecentApps = (state: RootState) => state.recentApps.items;

export default recentAppsSlice.reducer;
