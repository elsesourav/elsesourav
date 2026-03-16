import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

type UiState = {
  pendingByKey: Record<string, number>;
};

const initialState: UiState = {
  pendingByKey: {},
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    startPending(state, action: PayloadAction<string>) {
      const key = action.payload;
      state.pendingByKey[key] = (state.pendingByKey[key] ?? 0) + 1;
    },
    stopPending(state, action: PayloadAction<string>) {
      const key = action.payload;
      const next = (state.pendingByKey[key] ?? 0) - 1;

      if (next <= 0) {
        delete state.pendingByKey[key];
        return;
      }

      state.pendingByKey[key] = next;
    },
    clearPending(state, action: PayloadAction<string>) {
      delete state.pendingByKey[action.payload];
    },
    clearAllPending(state) {
      state.pendingByKey = {};
    },
  },
});

export const { startPending, stopPending, clearPending, clearAllPending } =
  uiSlice.actions;

export const selectIsPending = (state: RootState, key: string) =>
  (state.ui.pendingByKey[key] ?? 0) > 0;

export default uiSlice.reducer;
