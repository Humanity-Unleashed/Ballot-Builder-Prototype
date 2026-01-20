/**
 * Stores Index
 *
 * Re-exports all stores and helpers for convenient imports.
 */

export {
  useUserStore,
  type SwipeEvent,
  type AxisScore,
  // Selectors
  selectPersona,
  selectSwipes,
  selectBlueprintProfile,
  selectAxisScores,
  selectHasCompletedOnboarding,
  selectHasCompletedAssessment,
  selectAxisScore,
  selectAxisProfile,
  selectDomainProfile,
} from './userStore';

export {
  createDefaultProfile,
  updateProfileFromScores,
  scoreAndUpdateProfile,
  initializeProfileFromSwipes,
} from './blueprintHelpers';
