import { Redirect } from 'expo-router';

export default function Index() {
  // For Day 3 testing, we will automatically redirect the root screen to the login screen.
  // Once we build the real Tracker dashboard, we will check the Supabase session here.
  return <Redirect href="/(auth)/login" />;
}
