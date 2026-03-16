import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

type LibraryState = {
  savedAppIds: string[];
};

const initialState: LibraryState = {
  savedAppIds: [],
};

function toUniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    setSavedAppIds(state, action: PayloadAction<string[]>) {
      state.savedAppIds = toUniqueIds(action.payload);
    },
    markAppSaved(state, action: PayloadAction<string>) {
      if (!state.savedAppIds.includes(action.payload)) {
        state.savedAppIds.push(action.payload);
      }
    },
    unmarkAppSaved(state, action: PayloadAction<string>) {
      state.savedAppIds = state.savedAppIds.filter(
        (id) => id !== action.payload,
      );
    },
    toggleAppSaved(state, action: PayloadAction<string>) {
      const appId = action.payload;
      if (state.savedAppIds.includes(appId)) {
        state.savedAppIds = state.savedAppIds.filter((id) => id !== appId);
        return;
      }

      state.savedAppIds.push(appId);
    },
    clearSavedApps(state) {
      state.savedAppIds = [];
    },
  },
});

export const {
  setSavedAppIds,
  markAppSaved,
  unmarkAppSaved,
  toggleAppSaved,
  clearSavedApps,
} = librarySlice.actions;

export const selectSavedAppIds = (state: RootState) =>
  state.library.savedAppIds;

export const selectIsAppSaved = (state: RootState, appId: string) =>
  state.library.savedAppIds.includes(appId);

export default librarySlice.reducer;
