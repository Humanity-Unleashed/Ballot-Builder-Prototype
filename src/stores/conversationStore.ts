import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ConversationSession,
  ConversationMessage,
  BallotItemConversation,
  ValueSignal,
  ProgressiveAxisValue,
  ItemStatus,
} from '@/types/conversation';
import { DOMAIN_ORDER, getRelevantDomains } from '@/types/conversation';
import type { DomainId } from '@/types/conversation';
import type { ValueAxis } from '@/lib/ballotHelpers';
import type { PropositionRecommendation, CandidateMatch } from '@/lib/ballotHelpers';

interface ConversationState {
  _hasHydrated: boolean;
  session: ConversationSession | null;
}

interface ConversationActions {
  startSession: () => void;
  selectState: (ballotId: string, itemIds: string[], relevantAxes: string[]) => void;
  completeDemographics: () => void;
  skipDemographics: () => void;
  addWarmupMessage: (message: ConversationMessage) => void;
  incrementWarmupTurn: () => void;
  advanceDomain: () => void;
  finishWarmup: () => void;
  addMessage: (itemId: string, message: ConversationMessage) => void;
  applyValueSignals: (signals: ValueSignal[]) => void;
  setItemStatus: (itemId: string, status: ItemStatus) => void;
  setItemRecommendation: (itemId: string, rec: PropositionRecommendation | CandidateMatch[]) => void;
  recordVote: (itemId: string, choice: string | null) => void;
  advanceToNext: () => void;
  getProgressiveAxes: (axisDefinitions: Array<{ id: string; name: string; description: string; poleA: { label: string }; poleB: { label: string } }>) => ValueAxis[];
  getCurrentItem: () => BallotItemConversation | null;
  getCurrentItemId: () => string | null;
  updateProfile: (profile: Record<string, ProgressiveAxisValue>) => void;
  resetSession: () => void;
}

type ConversationStore = ConversationState & ConversationActions;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const initialState: ConversationState = {
  _hasHydrated: false,
  session: null,
};

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: () => {
        set({
          session: {
            sessionId: generateId(),
            ballotId: '',
            phase: 'state-select',
            profile: {},
            warmupMessages: [],
            warmupTurnCount: 0,
            currentDomainIndex: 0,
            domainTurnCount: 0,
            relevantAxes: [],
            relevantDomains: [],
            items: {},
            itemOrder: [],
            currentItemIndex: 0,
            completedCount: 0,
            totalCount: 0,
          },
        });
      },

      selectState: (ballotId, itemIds, relevantAxes) => {
        const { session } = get();
        if (!session) return;

        const items: Record<string, BallotItemConversation> = {};
        for (const id of itemIds) {
          items[id] = {
            ballotItemId: id,
            status: 'pending',
            turnCount: 0,
            messages: [],
          };
        }

        const relevantDomains = relevantAxes.length > 0
          ? getRelevantDomains(relevantAxes)
          : [...DOMAIN_ORDER] as DomainId[];

        set({
          session: {
            ...session,
            ballotId,
            phase: 'demographics',
            relevantAxes,
            relevantDomains,
            items,
            itemOrder: itemIds,
            totalCount: itemIds.length,
          },
        });
      },

      completeDemographics: () => {
        const { session } = get();
        if (!session) return;

        const firstDomainIndex = session.relevantDomains.length > 0
          ? DOMAIN_ORDER.indexOf(session.relevantDomains[0])
          : 0;

        set({
          session: {
            ...session,
            phase: 'warmup',
            currentDomainIndex: firstDomainIndex,
          },
        });
      },

      skipDemographics: () => {
        const { session } = get();
        if (!session) return;

        const firstDomainIndex = session.relevantDomains.length > 0
          ? DOMAIN_ORDER.indexOf(session.relevantDomains[0])
          : 0;

        set({
          session: {
            ...session,
            phase: 'warmup',
            currentDomainIndex: firstDomainIndex,
          },
        });
      },

      addWarmupMessage: (message) => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            warmupMessages: [...session.warmupMessages, message],
          },
        });
      },

      incrementWarmupTurn: () => {
        const { session } = get();
        if (!session) return;

        set({
          session: {
            ...session,
            warmupTurnCount: session.warmupTurnCount + 1,
            domainTurnCount: session.domainTurnCount + 1,
          },
        });
      },

      advanceDomain: () => {
        const { session } = get();
        if (!session) return;

        const relevantDomains = session.relevantDomains ?? [...DOMAIN_ORDER];
        const currentDomain = DOMAIN_ORDER[session.currentDomainIndex];

        // Find the next relevant domain after the current one
        const currentRelevantIdx = relevantDomains.indexOf(currentDomain as DomainId);
        const nextRelevantDomain = relevantDomains[currentRelevantIdx + 1];

        if (!nextRelevantDomain) {
          // All relevant domains complete — transition to ballot phase
          set({ session: { ...session, phase: 'ballot' } });
        } else {
          const nextIndex = DOMAIN_ORDER.indexOf(nextRelevantDomain);
          set({
            session: {
              ...session,
              currentDomainIndex: nextIndex,
              domainTurnCount: 0,
            },
          });
        }
      },

      finishWarmup: () => {
        const { session } = get();
        if (!session) return;

        set({
          session: { ...session, phase: 'ballot' },
        });
      },

      addMessage: (itemId, message) => {
        const { session } = get();
        if (!session) return;

        const item = session.items[itemId];
        if (!item) return;

        const updatedItem: BallotItemConversation = {
          ...item,
          messages: [...item.messages, message],
          turnCount: message.role === 'user' ? item.turnCount + 1 : item.turnCount,
          status: item.status === 'pending' ? 'discussing' : item.status,
        };

        set({
          session: {
            ...session,
            items: { ...session.items, [itemId]: updatedItem },
          },
        });
      },

      applyValueSignals: (signals) => {
        const { session } = get();
        if (!session) return;

        const updatedProfile = { ...session.profile };

        for (const signal of signals) {
          const existing = updatedProfile[signal.axisId];
          const importance = signal.importance ?? 5;
          if (existing) {
            const totalWeight = existing.confidence * existing.signalCount + signal.confidence;
            const newValue = totalWeight > 0
              ? (existing.value * existing.confidence * existing.signalCount + signal.direction * signal.confidence) / totalWeight
              : signal.direction;
            // Weighted average of importance across signals
            const newImportance = (existing.importance * existing.signalCount + importance) / (existing.signalCount + 1);

            updatedProfile[signal.axisId] = {
              value: Math.max(0, Math.min(10, Math.round(newValue * 10) / 10)),
              confidence: Math.min(1, (existing.confidence + signal.confidence) / 2),
              importance: Math.max(0, Math.min(10, Math.round(newImportance * 10) / 10)),
              signalCount: existing.signalCount + 1,
            };
          } else {
            updatedProfile[signal.axisId] = {
              value: signal.direction,
              confidence: signal.confidence,
              importance,
              signalCount: 1,
            };
          }
        }

        set({
          session: { ...session, profile: updatedProfile },
        });
      },

      setItemStatus: (itemId, status) => {
        const { session } = get();
        if (!session) return;

        const item = session.items[itemId];
        if (!item) return;

        set({
          session: {
            ...session,
            items: {
              ...session.items,
              [itemId]: { ...item, status },
            },
          },
        });
      },

      setItemRecommendation: (itemId, rec) => {
        const { session } = get();
        if (!session) return;

        const item = session.items[itemId];
        if (!item) return;

        set({
          session: {
            ...session,
            items: {
              ...session.items,
              [itemId]: { ...item, recommendation: rec, status: 'recommended' },
            },
          },
        });
      },

      recordVote: (itemId, choice) => {
        const { session } = get();
        if (!session) return;

        const item = session.items[itemId];
        if (!item) return;

        const wasCompleted = item.status === 'voted' || item.status === 'skipped';
        const newStatus: ItemStatus = choice === null ? 'skipped' : 'voted';

        set({
          session: {
            ...session,
            items: {
              ...session.items,
              [itemId]: { ...item, userVote: choice, status: newStatus },
            },
            completedCount: wasCompleted
              ? session.completedCount
              : session.completedCount + 1,
          },
        });
      },

      advanceToNext: () => {
        const { session } = get();
        if (!session) return;

        const nextIndex = session.currentItemIndex + 1;
        set({
          session: { ...session, currentItemIndex: nextIndex },
        });
      },

      getProgressiveAxes: (axisDefinitions) => {
        const { session } = get();
        if (!session) return [];

        return axisDefinitions.map((axisDef) => {
          const profileValue = session.profile[axisDef.id];
          return {
            id: axisDef.id,
            name: axisDef.name,
            description: axisDef.description,
            value: profileValue?.value ?? 5,
            poleA: axisDef.poleA.label,
            poleB: axisDef.poleB.label,
            weight: profileValue ? (profileValue.importance ?? 5) / 5 : 1, // normalize 0-10 → 0-2
          };
        });
      },

      getCurrentItem: () => {
        const { session } = get();
        if (!session) return null;
        const itemId = session.itemOrder[session.currentItemIndex];
        return itemId ? session.items[itemId] ?? null : null;
      },

      getCurrentItemId: () => {
        const { session } = get();
        if (!session) return null;
        return session.itemOrder[session.currentItemIndex] ?? null;
      },

      updateProfile: (profile) => {
        const { session } = get();
        if (!session) return;

        set({ session: { ...session, profile } });
      },

      resetSession: () => {
        set({ session: null });
      },
    }),
    {
      name: 'conversation-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);

export const selectSession = (state: ConversationStore) => state.session;
export const selectConversationHasHydrated = (state: ConversationStore) => state._hasHydrated;
