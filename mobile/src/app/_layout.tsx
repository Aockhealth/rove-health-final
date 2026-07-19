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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
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
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
