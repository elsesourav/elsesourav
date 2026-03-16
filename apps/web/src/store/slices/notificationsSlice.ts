import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export type NotificationTone = "info" | "success" | "error";

export type NotificationItem = {
  id: string;
  message: string;
  tone: NotificationTone;
  durationMs: number;
  createdAt: number;
};

type NotificationsState = {
  items: NotificationItem[];
};

const MAX_NOTIFICATIONS = 6;

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    enqueueNotification: {
      reducer(state, action: PayloadAction<NotificationItem>) {
        state.items.unshift(action.payload);
        state.items = state.items.slice(0, MAX_NOTIFICATIONS);
      },
      prepare(payload: {
        message: string;
        tone?: NotificationTone;
        durationMs?: number;
      }) {
        return {
          payload: {
            id: nanoid(),
            message: payload.message,
            tone: payload.tone ?? "info",
            durationMs: payload.durationMs ?? 3600,
            createdAt: Date.now(),
          },
        };
      },
    },
    dismissNotification(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearNotifications(state) {
      state.items = [];
    },
  },
});

export const { enqueueNotification, dismissNotification, clearNotifications } =
  notificationsSlice.actions;

export const selectNotifications = (state: RootState) =>
  state.notifications.items;

export default notificationsSlice.reducer;
