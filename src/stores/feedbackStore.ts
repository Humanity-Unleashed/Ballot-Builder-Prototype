import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FeedbackEntry {
  id: string;
  timestamp: string;
  screen: string;
  screenName: string;
  type: string | null;
  message: string;
}

interface FeedbackState {
  entries: FeedbackEntry[];
}

interface FeedbackActions {
  addFeedback: (entry: FeedbackEntry) => void;
  clearFeedback: () => void;
}

type FeedbackStore = FeedbackState & FeedbackActions;

export const useFeedbackStore = create<FeedbackStore>()(
  persist(
    (set) => ({
      entries: [],

      addFeedback: (entry) => {
        set((state) => ({ entries: [...state.entries, entry] }));
      },

      clearFeedback: () => {
        set({ entries: [] });
      },
    }),
    {
      name: 'feedback-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
