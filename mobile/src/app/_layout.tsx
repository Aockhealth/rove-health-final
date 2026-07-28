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
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_600SemiBold_Italic,
  CormorantGaramond_700Bold,
  CormorantGaramond_700Bold_Italic
} from '@expo-google-fonts/cormorant-garamond';

import {
  Raleway_400Regular,
  Raleway_400Regular_Italic,
  Raleway_500Medium,
  Raleway_500Medium_Italic,
  Raleway_600SemiBold,
  Raleway_600SemiBold_Italic,
  Raleway_700Bold,
  Raleway_700Bold_Italic,
  Raleway_800ExtraBold,
  Raleway_800ExtraBold_Italic
} from '@expo-google-fonts/raleway';

import * as Sentry from '@sentry/react-native';
import { trackEvent } from '../lib/analytics';

import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import * as NavigationBar from 'expo-navigation-bar';
import { Platform, Text, TextInput } from 'react-native';

if (Platform.OS === 'android') {
  NavigationBar.setBackgroundColorAsync('#FAF9F6');
  NavigationBar.setButtonStyleAsync('dark');
}

// Set global default font for Text and TextInput
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = { fontFamily: 'Raleway-Medium' };
(Text as any).defaultProps.maxFontSizeMultiplier = 1.2;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.style = { fontFamily: 'Raleway-Medium' };
(TextInput as any).defaultProps.maxFontSizeMultiplier = 1.2;

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
    'CormorantGaramond-Regular': CormorantGaramond_400Regular,
    'CormorantGaramond-Italic': CormorantGaramond_400Regular_Italic,
    'CormorantGaramond-Medium': CormorantGaramond_500Medium,
    'CormorantGaramond-MediumItalic': CormorantGaramond_500Medium_Italic,
    'CormorantGaramond-SemiBold': CormorantGaramond_600SemiBold,
    'CormorantGaramond-SemiBoldItalic': CormorantGaramond_600SemiBold_Italic,
    'CormorantGaramond-Bold': CormorantGaramond_700Bold,
    'CormorantGaramond-BoldItalic': CormorantGaramond_700Bold_Italic,
    'Raleway-Regular': Raleway_400Regular,
    'Raleway-Italic': Raleway_400Regular_Italic,
    'Raleway-Medium': Raleway_500Medium,
    'Raleway-MediumItalic': Raleway_500Medium_Italic,
    'Raleway-SemiBold': Raleway_600SemiBold,
    'Raleway-SemiBoldItalic': Raleway_600SemiBold_Italic,
    'Raleway-Bold': Raleway_700Bold,
    'Raleway-BoldItalic': Raleway_700Bold_Italic,
    'Raleway-ExtraBold': Raleway_800ExtraBold,
    'Raleway-ExtraBoldItalic': Raleway_800ExtraBold_Italic,
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
