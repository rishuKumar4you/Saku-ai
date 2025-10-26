'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {auth} from '@/lib/auth';

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const session = await auth.api.getSession(
            {headers: await import('next/headers').then(m => m.headers())});

        if (session) {
          // Check if user has completed onboarding
          const response = await fetch('/api/user/onboarding-status');
          if (response.ok) {
            const data = await response.json();
            if (!data.onboardingCompleted) {
              router.push('/onboarding/features');
            } else {
              router.push('/');
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthAndRedirect();
  }, [router]);
}
