import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '../userStore';

describe('userStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUserStore.getState().reset();
  });

  describe('recordSwipe', () => {
    it('adds a swipe with timestamp', () => {
      useUserStore.getState().recordSwipe({ item_id: 'item-1', response: 'agree' });
      const swipes = useUserStore.getState().swipes;
      expect(swipes).toHaveLength(1);
      expect(swipes[0].item_id).toBe('item-1');
      expect(swipes[0].response).toBe('agree');
      expect(swipes[0].timestamp).toBeTruthy();
    });

    it('accumulates multiple swipes', () => {
      const store = useUserStore.getState();
      store.recordSwipe({ item_id: 'item-1', response: 'agree' });
      store.recordSwipe({ item_id: 'item-2', response: 'disagree' });
      expect(useUserStore.getState().swipes).toHaveLength(2);
    });
  });

  describe('clearSwipes', () => {
    it('clears all swipes and scores', () => {
      useUserStore.getState().recordSwipe({ item_id: 'item-1', response: 'agree' });
      useUserStore.getState().clearSwipes();
      expect(useUserStore.getState().swipes).toEqual([]);
      expect(useUserStore.getState().axisScores).toEqual({});
    });
  });

  describe('setBlueprintProfile', () => {
    it('sets profile', () => {
      const profile = {
        profile_version: '1.0.0',
        user_id: 'test',
        updated_at: new Date().toISOString(),
        domains: [],
      };
      useUserStore.getState().setBlueprintProfile(profile);
      expect(useUserStore.getState().blueprintProfile).toEqual(profile);
    });

    it('can clear profile with null', () => {
      useUserStore.getState().setBlueprintProfile({
        profile_version: '1.0.0',
        user_id: 'test',
        updated_at: new Date().toISOString(),
        domains: [],
      });
      useUserStore.getState().setBlueprintProfile(null);
      expect(useUserStore.getState().blueprintProfile).toBeNull();
    });
  });

  describe('updateAxisValue', () => {
    it('updates axis value in profile', () => {
      const profile = {
        profile_version: '1.0.0',
        user_id: 'test',
        updated_at: new Date().toISOString(),
        domains: [{
          domain_id: 'econ',
          importance: {
            value_0_10: 5,
            source: 'default' as const,
            confidence_0_1: 0,
            last_updated_at: new Date().toISOString(),
          },
          axes: [{
            axis_id: 'econ_a1',
            value_0_10: 5,
            source: 'default' as const,
            confidence_0_1: 0,
            locked: false,
            learning_mode: 'normal' as const,
            estimates: { learned_score: 0, learned_value_float: 5 },
            evidence: { n_items_answered: 0, n_unsure: 0, top_driver_item_ids: [] },
          }],
        }],
      };
      useUserStore.getState().setBlueprintProfile(profile);
      useUserStore.getState().updateAxisValue('econ_a1', 8);

      const updated = useUserStore.getState().blueprintProfile!;
      const axis = updated.domains[0].axes[0];
      expect(axis.value_0_10).toBe(8);
      expect(axis.source).toBe('user_edited');
    });

    it('does nothing without profile', () => {
      useUserStore.getState().updateAxisValue('econ_a1', 8);
      expect(useUserStore.getState().blueprintProfile).toBeNull();
    });
  });

  describe('toggleAxisLock', () => {
    it('toggles lock state', () => {
      const profile = {
        profile_version: '1.0.0',
        user_id: 'test',
        updated_at: new Date().toISOString(),
        domains: [{
          domain_id: 'econ',
          importance: {
            value_0_10: 5,
            source: 'default' as const,
            confidence_0_1: 0,
            last_updated_at: new Date().toISOString(),
          },
          axes: [{
            axis_id: 'econ_a1',
            value_0_10: 5,
            source: 'default' as const,
            confidence_0_1: 0,
            locked: false,
            learning_mode: 'normal' as const,
            estimates: { learned_score: 0, learned_value_float: 5 },
            evidence: { n_items_answered: 0, n_unsure: 0, top_driver_item_ids: [] },
          }],
        }],
      };
      useUserStore.getState().setBlueprintProfile(profile);

      // Lock
      useUserStore.getState().toggleAxisLock('econ_a1');
      let axis = useUserStore.getState().blueprintProfile!.domains[0].axes[0];
      expect(axis.locked).toBe(true);
      expect(axis.learning_mode).toBe('frozen');

      // Unlock
      useUserStore.getState().toggleAxisLock('econ_a1');
      axis = useUserStore.getState().blueprintProfile!.domains[0].axes[0];
      expect(axis.locked).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets to initial state', () => {
      useUserStore.getState().recordSwipe({ item_id: 'item-1', response: 'agree' });
      useUserStore.getState().completeOnboarding();
      useUserStore.getState().reset();

      const state = useUserStore.getState();
      expect(state.swipes).toEqual([]);
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(state.hasCompletedAssessment).toBe(false);
      expect(state.blueprintProfile).toBeNull();
    });
  });

  describe('assessmentProgress', () => {
    const progress = {
      axisQueue: ['axis-1', 'axis-2', 'axis-3'],
      currentAxisIndex: 1,
      sliderPositions: { 'axis-1': 3 },
      strengthValues: { 'axis-1': 7 },
    };

    it('starts as null', () => {
      expect(useUserStore.getState().assessmentProgress).toBeNull();
    });

    it('saveAssessmentProgress stores progress', () => {
      useUserStore.getState().saveAssessmentProgress(progress);
      expect(useUserStore.getState().assessmentProgress).toEqual(progress);
    });

    it('saveAssessmentProgress overwrites previous progress', () => {
      useUserStore.getState().saveAssessmentProgress(progress);
      const updated = { ...progress, currentAxisIndex: 2 };
      useUserStore.getState().saveAssessmentProgress(updated);
      expect(useUserStore.getState().assessmentProgress?.currentAxisIndex).toBe(2);
    });

    it('clearAssessmentProgress sets progress to null', () => {
      useUserStore.getState().saveAssessmentProgress(progress);
      useUserStore.getState().clearAssessmentProgress();
      expect(useUserStore.getState().assessmentProgress).toBeNull();
    });

    it('resetUserData clears assessmentProgress', () => {
      useUserStore.getState().saveAssessmentProgress(progress);
      useUserStore.getState().resetUserData();
      expect(useUserStore.getState().assessmentProgress).toBeNull();
    });

    it('reset clears assessmentProgress', () => {
      useUserStore.getState().saveAssessmentProgress(progress);
      useUserStore.getState().reset();
      expect(useUserStore.getState().assessmentProgress).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectHasCompletedOnboarding works', () => {
      expect(useUserStore.getState().hasCompletedOnboarding).toBe(false);
      useUserStore.getState().completeOnboarding();
      expect(useUserStore.getState().hasCompletedOnboarding).toBe(true);
    });

    it('selectHasCompletedAssessment works', () => {
      expect(useUserStore.getState().hasCompletedAssessment).toBe(false);
      useUserStore.getState().completeAssessment();
      expect(useUserStore.getState().hasCompletedAssessment).toBe(true);
    });

    it('getAxisScore returns null for unknown axis', () => {
      expect(useUserStore.getState().getAxisScore('unknown')).toBeNull();
    });
  });
});
