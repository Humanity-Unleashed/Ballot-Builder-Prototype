/**
 * Stores Index
 *
 * Re-exports all stores and helpers for convenient imports.
 */

export {
  useUserStore,
  type SwipeEvent,
  type SwipeInput,
  type AxisScore,
  // Selectors
  selectSpec,
  selectIsSpecLoading,
  selectSpecError,
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
