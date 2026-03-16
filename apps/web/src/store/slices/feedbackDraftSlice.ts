import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export type FeedbackDraft = {
  rating: number;
  message: string;
};

type FeedbackDraftState = {
  byAppId: Record<string, FeedbackDraft>;
};

const initialState: FeedbackDraftState = {
  byAppId: {},
};

const feedbackDraftSlice = createSlice({
  name: "feedbackDraft",
  initialState,
  reducers: {
    upsertFeedbackDraft(
      state,
      action: PayloadAction<{
        appId: string;
        draft: FeedbackDraft;
      }>,
    ) {
      state.byAppId[action.payload.appId] = action.payload.draft;
    },
    removeFeedbackDraft(state, action: PayloadAction<string>) {
      delete state.byAppId[action.payload];
    },
    clearFeedbackDrafts(state) {
      state.byAppId = {};
    },
  },
});

export const { upsertFeedbackDraft, removeFeedbackDraft, clearFeedbackDrafts } =
  feedbackDraftSlice.actions;

export const selectFeedbackDraft = (state: RootState, appId: string) =>
  state.feedbackDraft.byAppId[appId] ?? null;

export default feedbackDraftSlice.reducer;
