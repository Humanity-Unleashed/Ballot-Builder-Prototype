import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SquadMember {
  id: string;
  name: string;
  isCreator: boolean;
  checkpoints: {
    account: boolean;
    registration: boolean;
    ballot: boolean;
    voted: boolean;
  };
}

interface SquadState {
  _hasHydrated: boolean;
  squadId: string | null;
  squadName: string;
  members: SquadMember[];
  inviteCode: string | null;
}

interface SquadActions {
  createSquad: (name: string, creatorName: string) => void;
  getInviteUrl: () => string;
  hasSquad: () => boolean;
  leaveSquad: () => void;
}

type SquadStore = SquadState & SquadActions;

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const initialState: SquadState = {
  _hasHydrated: false,
  squadId: null,
  squadName: '',
  members: [],
  inviteCode: null,
};

export const useSquadStore = create<SquadStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      createSquad: (name: string, creatorName: string) => {
        const inviteCode = generateInviteCode();
        const creator: SquadMember = {
          id: generateId(),
          name: creatorName,
          isCreator: true,
          checkpoints: { account: true, registration: true, ballot: true, voted: false },
        };
        const demoMembers: SquadMember[] = [
          {
            id: generateId(),
            name: 'Alex',
            isCreator: false,
            checkpoints: { account: true, registration: true, ballot: false, voted: false },
          },
          {
            id: generateId(),
            name: 'Jordan',
            isCreator: false,
            checkpoints: { account: true, registration: false, ballot: false, voted: false },
          },
        ];
        set({
          squadId: generateId(),
          squadName: name,
          members: [creator, ...demoMembers],
          inviteCode,
        });
      },

      getInviteUrl: () => {
        const { inviteCode } = get();
        if (!inviteCode) return '';
        if (typeof window !== 'undefined') {
          return `${window.location.origin}/join?squad=${inviteCode}`;
        }
        return `https://ballotbuilder.org/join?squad=${inviteCode}`;
      },

      hasSquad: () => {
        return get().squadId !== null;
      },

      leaveSquad: () => {
        set({
          squadId: null,
          squadName: '',
          members: [],
          inviteCode: null,
        });
      },
    }),
    {
      name: 'ballot-builder-squad',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        squadId: state.squadId,
        squadName: state.squadName,
        members: state.members,
        inviteCode: state.inviteCode,
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
export const selectSquadHasHydrated = (state: SquadStore) => state._hasHydrated;
export const selectHasSquad = (state: SquadStore) => state.squadId !== null;
export const selectSquadName = (state: SquadStore) => state.squadName;
export const selectMembers = (state: SquadStore) => state.members;
export const selectInviteCode = (state: SquadStore) => state.inviteCode;
