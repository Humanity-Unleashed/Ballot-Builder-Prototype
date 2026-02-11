import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserVote } from '@/lib/ballotHelpers';

interface BallotState {
  _hasHydrated: boolean;
  savedVotes: UserVote[];
  currentIndex: number;
  showSummary: boolean;
}

interface BallotActions {
  saveVote: (vote: UserVote) => void;
  setCurrentIndex: (index: number) => void;
  setShowSummary: (show: boolean) => void;
  clearBallot: () => void;
  getVoteForItem: (itemId: string) => UserVote | undefined;
}

type BallotStore = BallotState & BallotActions;

const initialState: BallotState = {
  _hasHydrated: false,
  savedVotes: [],
  currentIndex: 0,
  showSummary: false,
};

export const useBallotStore = create<BallotStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      saveVote: (vote) => {
        set((state) => ({
          savedVotes: [
            ...state.savedVotes.filter((v) => v.itemId !== vote.itemId),
            vote,
          ],
        }));
      },

      setCurrentIndex: (index) => {
        set({ currentIndex: index });
      },

      setShowSummary: (show) => {
        set({ showSummary: show });
      },

      clearBallot: () => {
        set({
          savedVotes: [],
          currentIndex: 0,
          showSummary: false,
        });
      },

      getVoteForItem: (itemId) => {
        return get().savedVotes.find((v) => v.itemId === itemId);
      },
    }),
    {
      name: 'ballot-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedVotes: state.savedVotes,
        currentIndex: state.currentIndex,
        showSummary: state.showSummary,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);

// Selectors
export const selectBallotHasHydrated = (state: BallotStore) => state._hasHydrated;
export const selectSavedVotes = (state: BallotStore) => state.savedVotes;
export const selectCurrentIndex = (state: BallotStore) => state.currentIndex;
export const selectShowSummary = (state: BallotStore) => state.showSummary;
