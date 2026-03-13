import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserVote } from '@/lib/ballotHelpers';
import type { ConversationMessage } from '@/types/conversation';

/** Wizard phases in order */
export type WizardPhase =
  | 'state-select'
  | 'demographics'
  | 'assessment'
  | 'profile-review'
  | 'ballot-item'
  | 'summary';

export const WIZARD_PHASES: WizardPhase[] = [
  'state-select',
  'demographics',
  'assessment',
  'profile-review',
  'ballot-item',
  'summary',
];

/** Labels for display in the WizardNav */
export const WIZARD_PHASE_LABELS: Record<WizardPhase, string> = {
  'state-select': 'Ballot',
  'demographics': 'About You',
  'assessment': 'Values',
  'profile-review': 'Profile',
  'ballot-item': 'Build',
  'summary': 'Summary',
};

// ── Display phases for the collapsible banner nav ──

/** The 3 high-level display phases shown in the nav */
export type DisplayPhase = 'select-ballot' | 'blueprint' | 'build';

export const DISPLAY_PHASES: DisplayPhase[] = ['select-ballot', 'blueprint', 'build'];

export const DISPLAY_PHASE_CONFIG: Record<DisplayPhase, {
  label: string;
  /** Internal WizardPhases that belong to this display phase */
  wizardPhases: WizardPhase[];
  /** Sub-step labels shown inside the banner */
  subSteps: string[];
}> = {
  'select-ballot': {
    label: 'Select Ballot',
    wizardPhases: ['state-select'],
    subSteps: [],
  },
  'blueprint': {
    label: 'Civic Blueprint',
    wizardPhases: ['demographics', 'assessment', 'profile-review'],
    subSteps: ['About You', 'Values Assessment', 'Profile Review'],
  },
  'build': {
    label: 'Build',
    wizardPhases: ['ballot-item', 'summary'],
    subSteps: [],
  },
};

/** Map a WizardPhase to its parent DisplayPhase */
export function getDisplayPhase(wizardPhase: WizardPhase): DisplayPhase {
  for (const [dp, config] of Object.entries(DISPLAY_PHASE_CONFIG)) {
    if (config.wizardPhases.includes(wizardPhase)) return dp as DisplayPhase;
  }
  return 'select-ballot';
}

/** Get the sub-step index within a display phase (0-based), or -1 if not applicable */
export function getSubStepIndex(wizardPhase: WizardPhase): number {
  const dp = getDisplayPhase(wizardPhase);
  const config = DISPLAY_PHASE_CONFIG[dp];
  return config.wizardPhases.indexOf(wizardPhase);
}

/** Check if an entire display phase is completed */
export function isDisplayPhaseCompleted(
  displayPhase: DisplayPhase,
  completedPhases: WizardPhase[],
): boolean {
  const config = DISPLAY_PHASE_CONFIG[displayPhase];
  return config.wizardPhases.every((wp) => completedPhases.includes(wp));
}

interface BallotState {
  _hasHydrated: boolean;

  // Wizard state
  currentPhase: WizardPhase;
  /** Track which phases have been completed (for back-navigation) */
  completedPhases: WizardPhase[];

  // Ballot voting state
  savedVotes: UserVote[];
  currentIndex: number;
  showSummary: boolean;
  hasSeenIntro: boolean;

  // Per-item AI chat messages (keyed by ballot item ID)
  itemMessages: Record<string, ConversationMessage[]>;
}

interface BallotActions {
  // Wizard navigation
  setPhase: (phase: WizardPhase) => void;
  advancePhase: () => void;
  goToPhase: (phase: WizardPhase) => void;
  markPhaseCompleted: (phase: WizardPhase) => void;
  isPhaseCompleted: (phase: WizardPhase) => boolean;
  isPhaseAccessible: (phase: WizardPhase) => boolean;

  // Ballot voting
  saveVote: (vote: UserVote) => void;
  setCurrentIndex: (index: number) => void;
  setShowSummary: (show: boolean) => void;
  dismissIntro: () => void;
  clearBallot: () => void;
  getVoteForItem: (itemId: string) => UserVote | undefined;

  // Per-item AI chat
  addItemMessage: (itemId: string, message: ConversationMessage) => void;
  getItemMessages: (itemId: string) => ConversationMessage[];
  clearItemMessages: (itemId: string) => void;

  // Two-tier reset
  redoVotes: () => void;
  startFresh: () => void;
}

type BallotStore = BallotState & BallotActions;

const initialState: BallotState = {
  _hasHydrated: false,
  currentPhase: 'state-select',
  completedPhases: [],
  savedVotes: [],
  currentIndex: 0,
  showSummary: false,
  hasSeenIntro: false,
  itemMessages: {},
};

export const useBallotStore = create<BallotStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Wizard navigation ──

      setPhase: (phase) => {
        set({ currentPhase: phase });
      },

      advancePhase: () => {
        const { currentPhase, completedPhases } = get();
        const currentIdx = WIZARD_PHASES.indexOf(currentPhase);
        if (currentIdx < WIZARD_PHASES.length - 1) {
          const newCompleted = completedPhases.includes(currentPhase)
            ? completedPhases
            : [...completedPhases, currentPhase];
          set({
            currentPhase: WIZARD_PHASES[currentIdx + 1],
            completedPhases: newCompleted,
          });
        }
      },

      goToPhase: (phase) => {
        const { completedPhases, currentPhase } = get();
        const targetIdx = WIZARD_PHASES.indexOf(phase);
        const currentIdx = WIZARD_PHASES.indexOf(currentPhase);
        // Allow navigating to completed phases, the current phase, or any earlier phase
        if (
          completedPhases.includes(phase) ||
          phase === currentPhase ||
          targetIdx < currentIdx
        ) {
          set({ currentPhase: phase });
        }
      },

      markPhaseCompleted: (phase) => {
        const { completedPhases } = get();
        if (!completedPhases.includes(phase)) {
          set({ completedPhases: [...completedPhases, phase] });
        }
      },

      isPhaseCompleted: (phase) => {
        return get().completedPhases.includes(phase);
      },

      isPhaseAccessible: (phase) => {
        const { completedPhases, currentPhase } = get();
        const targetIdx = WIZARD_PHASES.indexOf(phase);
        const currentIdx = WIZARD_PHASES.indexOf(currentPhase);
        return phase === currentPhase || completedPhases.includes(phase) || targetIdx < currentIdx;
      },

      // ── Ballot voting ──

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

      dismissIntro: () => {
        set({ hasSeenIntro: true });
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

      // ── Per-item AI chat ──

      addItemMessage: (itemId, message) => {
        set((state) => ({
          itemMessages: {
            ...state.itemMessages,
            [itemId]: [...(state.itemMessages[itemId] || []), message],
          },
        }));
      },

      getItemMessages: (itemId) => {
        return get().itemMessages[itemId] || [];
      },

      clearItemMessages: (itemId) => {
        set((state) => {
          const updated = { ...state.itemMessages };
          delete updated[itemId];
          return { itemMessages: updated };
        });
      },

      // ── Two-tier reset ──

      /** Clear votes only, keep profile and demographics, go back to first ballot item */
      redoVotes: () => {
        set((state) => ({
          savedVotes: [],
          currentIndex: 0,
          showSummary: false,
          currentPhase: 'ballot-item',
          itemMessages: {},
          // Keep completedPhases up through profile-review
          completedPhases: state.completedPhases.filter(
            (p) => p !== 'ballot-item' && p !== 'summary'
          ),
        }));
      },

      /** Clear everything and restart the wizard */
      startFresh: () => {
        set({
          savedVotes: [],
          currentIndex: 0,
          showSummary: false,
          hasSeenIntro: false,
          currentPhase: 'state-select',
          completedPhases: [],
          itemMessages: {},
        });
      },
    }),
    {
      name: 'ballot-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentPhase: state.currentPhase,
        completedPhases: state.completedPhases,
        savedVotes: state.savedVotes,
        currentIndex: state.currentIndex,
        showSummary: state.showSummary,
        hasSeenIntro: state.hasSeenIntro,
        itemMessages: state.itemMessages,
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
export const selectCurrentPhase = (state: BallotStore) => state.currentPhase;
export const selectCompletedPhases = (state: BallotStore) => state.completedPhases;
export const selectSavedVotes = (state: BallotStore) => state.savedVotes;
export const selectCurrentIndex = (state: BallotStore) => state.currentIndex;
export const selectShowSummary = (state: BallotStore) => state.showSummary;
export const selectHasSeenIntro = (state: BallotStore) => state.hasSeenIntro;
