import feedbackDraftReducer from "@/store/slices/feedbackDraftSlice";
import libraryReducer from "@/store/slices/librarySlice";
import notificationsReducer from "@/store/slices/notificationsSlice";
import recentAppsReducer from "@/store/slices/recentAppsSlice";
import uiReducer from "@/store/slices/uiSlice";
import uploadReducer from "@/store/slices/uploadSlice";
import { configureStore } from "@reduxjs/toolkit";

export const createAppStore = () => {
  return configureStore({
    reducer: {
      ui: uiReducer,
      notifications: notificationsReducer,
      library: libraryReducer,
      recentApps: recentAppsReducer,
      feedbackDraft: feedbackDraftReducer,
      upload: uploadReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
