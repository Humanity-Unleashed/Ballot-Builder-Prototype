'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore, selectHasCompletedAssessment } from '@/stores/userStore';
import { useBallotStore } from '@/stores/ballotStore';

/**
 * /blueprint now redirects to the unified wizard at /ballot.
 * If assessment is done, jumps to profile-review; otherwise starts from the beginning.
 */
export default function BlueprintRedirect() {
  const router = useRouter();
  const hasCompletedAssessment = useUserStore(selectHasCompletedAssessment);
  const setPhase = useBallotStore((s) => s.setPhase);
  const markPhaseCompleted = useBallotStore((s) => s.markPhaseCompleted);

  useEffect(() => {
    if (hasCompletedAssessment) {
      // Jump directly to profile review
      markPhaseCompleted('state-select');
      markPhaseCompleted('demographics');
      markPhaseCompleted('assessment');
      setPhase('profile-review');
    }
    router.replace('/ballot');
  }, [hasCompletedAssessment, router, setPhase, markPhaseCompleted]);

  return null;
}
