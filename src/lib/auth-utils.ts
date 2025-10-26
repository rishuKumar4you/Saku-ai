import {headers} from 'next/headers';
import {redirect} from 'next/navigation';

import {auth} from './auth';
import db from './db';

export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  // Check if user has completed onboarding
  const user = await db.user.findUnique(
      {where: {id: session.user.id}, select: {onboardingCompleted: true}});

  if (!user?.onboardingCompleted) {
    redirect('/onboarding/features');
  }

  return session;
};

export const requireUnauth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    // Check if user has completed onboarding
    const user = await db.user.findUnique(
        {where: {id: session.user.id}, select: {onboardingCompleted: true}});

    if (user?.onboardingCompleted) {
      redirect('/');
    } else {
      redirect('/onboarding/features');
    }
  }
};