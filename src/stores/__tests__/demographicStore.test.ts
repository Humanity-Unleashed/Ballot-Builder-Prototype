import { describe, it, expect, beforeEach } from 'vitest';
import { useDemographicStore } from '../demographicStore';

describe('demographicStore', () => {
  beforeEach(() => {
    useDemographicStore.getState().reset();
  });

  describe('setField', () => {
    it('updates a single field', () => {
      useDemographicStore.getState().setField('ageRange', '25_34');
      expect(useDemographicStore.getState().profile.ageRange).toBe('25_34');
    });

    it('updates zipCode', () => {
      useDemographicStore.getState().setField('zipCode', '90210');
      expect(useDemographicStore.getState().profile.zipCode).toBe('90210');
    });

    it('preserves other fields when setting one', () => {
      useDemographicStore.getState().setField('ageRange', '25_34');
      useDemographicStore.getState().setField('housingSituation', 'rent');
      expect(useDemographicStore.getState().profile.ageRange).toBe('25_34');
      expect(useDemographicStore.getState().profile.housingSituation).toBe('rent');
    });
  });

  describe('submitProfile', () => {
    it('marks profile as completed', () => {
      useDemographicStore.getState().setField('ageRange', '25_34');
      useDemographicStore.getState().submitProfile();

      const state = useDemographicStore.getState();
      expect(state.hasCompletedDemographics).toBe(true);
      expect(state.wasSkipped).toBe(false);
      expect(state.completedAt).toBeTruthy();
    });
  });

  describe('skipProfile', () => {
    it('marks profile as skipped', () => {
      useDemographicStore.getState().skipProfile();

      const state = useDemographicStore.getState();
      expect(state.hasCompletedDemographics).toBe(true);
      expect(state.wasSkipped).toBe(true);
      expect(state.completedAt).toBeTruthy();
    });
  });

  describe('reset', () => {
    it('resets all state to defaults', () => {
      useDemographicStore.getState().setField('ageRange', '45_54');
      useDemographicStore.getState().submitProfile();
      useDemographicStore.getState().reset();

      const state = useDemographicStore.getState();
      expect(state.profile.ageRange).toBeNull();
      expect(state.profile.zipCode).toBe('');
      expect(state.hasCompletedDemographics).toBe(false);
      expect(state.wasSkipped).toBe(false);
      expect(state.completedAt).toBeNull();
    });
  });
});
