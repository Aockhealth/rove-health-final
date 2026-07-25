import 'react-native-reanimated';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

// Silence strict-mode warnings that flood the JS thread and freeze the UI
configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Toaster } from 'sonner-native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashIntro } from '../components/ui/SplashIntro';

import { 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';

import { 
  Outfit_400Regular, 
  Outfit_500Medium, 
  Outfit_600SemiBold, 
  Outfit_700Bold 
} from '@expo-google-fonts/outfit';

import { 
  CormorantGaramond_400Regular, 
  CormorantGaramond_500Medium, 
  CormorantGaramond_600SemiBold, 
  CormorantGaramond_700Bold 
} from '@expo-google-fonts/cormorant-garamond';

import * as Sentry from '@sentry/react-native';
import { trackEvent } from '../lib/analytics';

import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// No-ops safely with an empty DSN (see .env comment) — enable() only flips on
// once a real Sentry project exists and EXPO_PUBLIC_SENTRY_DSN is set.
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    },
  }));
  const [persister] = useState(() => createAsyncStoragePersister({
    storage: AsyncStorage,
  }));
  const [showIntro, setShowIntro] = useState(true);
  const [loaded, error] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
    'CormorantGaramond-Regular': CormorantGaramond_400Regular,
    'CormorantGaramond-Medium': CormorantGaramond_500Medium,
    'CormorantGaramond-SemiBold': CormorantGaramond_600SemiBold,
    'CormorantGaramond-Bold': CormorantGaramond_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  useEffect(() => {
    trackEvent('app_opened');
  }, []);

  if (!loaded && !error) {
    return null;
  }

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#FAF9F6' },
            }}
          >
            <Stack.Screen name="wellbeing/intro" options={{ presentation: 'modal' }} />
            <Stack.Screen name="wellbeing/assessment" options={{ presentation: 'modal' }} />
          </Stack>
          <Toaster />
          {showIntro && <SplashIntro onFinish={() => setShowIntro(false)} />}
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </PersistQueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
