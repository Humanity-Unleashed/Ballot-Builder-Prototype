'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /conversation now redirects to the unified wizard at /ballot.
 */
export default function ConversationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ballot');
  }, [router]);

  return null;
}
