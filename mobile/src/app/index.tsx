import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { fetchOnboardingCompleted } from '../lib/onboarding';
import { scheduleDailyTrackerReminder } from '../lib/notifications';
import { identifyUser } from '../lib/analytics';
import LoadingScreen from '../components/ui/LoadingScreen';

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        setOnboarded(await fetchOnboardingCompleted(session.user.id));
        identifyUser(session.user.id, { email: session.user.email });
        scheduleDailyTrackerReminder();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading || (session && onboarded === null)) {
    return <LoadingScreen />;
  }

  if (session) {
    if (!onboarded) {
      return <Redirect href="/onboarding" />;
    }
    return <Redirect href="/(app)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
