import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadItem = {
  progress: number;
  status: UploadStatus;
  error: string | null;
};

type UploadState = {
  byKey: Record<string, UploadItem>;
};

const initialState: UploadState = {
  byKey: {},
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    startUpload(state, action: PayloadAction<string>) {
      state.byKey[action.payload] = {
        progress: 0,
        status: "uploading",
        error: null,
      };
    },
    setUploadProgress(
      state,
      action: PayloadAction<{
        key: string;
        progress: number;
      }>,
    ) {
      const current = state.byKey[action.payload.key] ?? {
        progress: 0,
        status: "uploading",
        error: null,
      };

      current.progress = Math.max(0, Math.min(100, action.payload.progress));
      current.status = "uploading";
      current.error = null;
      state.byKey[action.payload.key] = current;
    },
    finishUpload(state, action: PayloadAction<string>) {
      state.byKey[action.payload] = {
        progress: 100,
        status: "success",
        error: null,
      };
    },
    failUpload(
      state,
      action: PayloadAction<{
        key: string;
        error: string;
      }>,
    ) {
      const current = state.byKey[action.payload.key] ?? {
        progress: 0,
        status: "error",
        error: null,
      };

      current.status = "error";
      current.error = action.payload.error;
      state.byKey[action.payload.key] = current;
    },
    resetUpload(state, action: PayloadAction<string>) {
      delete state.byKey[action.payload];
    },
    clearUploads(state) {
      state.byKey = {};
    },
  },
});

export const {
  startUpload,
  setUploadProgress,
  finishUpload,
  failUpload,
  resetUpload,
  clearUploads,
} = uploadSlice.actions;

export const selectUploadItem = (state: RootState, key: string) =>
  state.upload.byKey[key] ?? null;

export default uploadSlice.reducer;
