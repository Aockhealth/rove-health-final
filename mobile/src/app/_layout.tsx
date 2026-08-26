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
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Toaster } from 'sonner-native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nextProvider } from 'react-i18next';
import { SplashIntro } from '../components/ui/SplashIntro';
import i18n, { initI18n } from '../lib/i18n';
import { DEVANAGARI_FONT_MAP, getLocalizedFontFamily } from '../lib/fonts';

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

// Set global default font for Text and TextInput. allowFontScaling is locked
// off — the brand layout (fixed-padding pills, justify-between card stacks)
// breaks against the OS font-size setting (e.g. OnePlus/OxygenOS ships with
// a larger default than stock Android), so text is pinned to our own sizes.
// includeFontPadding is also disabled (Android-only, no-op on iOS) — with
// custom Google Fonts, Android's default extra glyph padding varies by OEM
// font renderer and was inflating line height enough to throw off the
// fixed-padding pills and the card layouts that depend on measured text height.
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.style = { fontFamily: 'Raleway-Medium', includeFontPadding: false };
(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
(TextInput as any).defaultProps.style = { fontFamily: 'Raleway-Medium', includeFontPadding: false };
(TextInput as any).defaultProps.allowFontScaling = false;

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
  const [i18nReady, setI18nReady] = useState(false);
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
    ...DEVANAGARI_FONT_MAP,
  });

  useEffect(() => {
    initI18n().then((language) => {
      // Default-styled Text (no explicit fontFamily) picks up the right
      // script for the language resolved at startup. A language switched
      // later from Profile settings takes effect for translated strings
      // immediately, but this default-font update only applies to Text
      // rendered fresh after the switch — expo-font's font map is loaded
      // once at startup and can't be hot-swapped (see lib/fonts.ts).
      const bodyFont = getLocalizedFontFamily('Raleway-Medium', language);
      (Text as any).defaultProps.style = { fontFamily: bodyFont, includeFontPadding: false };
      (TextInput as any).defaultProps.style = { fontFamily: bodyFont, includeFontPadding: false };
      setI18nReady(true);
    });
  }, []);

  useEffect(() => {
    if ((loaded || error) && i18nReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error, i18nReady]);

  useEffect(() => {
    trackEvent('app_opened');
  }, []);

  useEffect(() => {
    // Registers the background-sync task executor (see
    // healthBackgroundSync.ts) — must happen on every app start, not just
    // when Profile mounts, so the OS can find and re-invoke a task it
    // already scheduled from a previous session. Native-only: neither
    // expo-task-manager's background delivery nor HealthKit/Health Connect
    // exist on web.
    if (Platform.OS !== 'web') {
      import('../lib/healthBackgroundSync').catch((err) => {
        console.error('[_layout] failed to register health background task:', err);
      });
    }
  }, []);

  if ((!loaded && !error) || !i18nReady) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <SafeAreaProvider>
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
      </SafeAreaProvider>
    </I18nextProvider>
  );
}

export default Sentry.wrap(RootLayout);
