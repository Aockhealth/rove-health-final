import { AppState, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Only polyfill URL on native devices, NOT in the Node.js SSR background process
if (typeof process === 'undefined' || process.release?.name !== 'node') {
  require('react-native-url-polyfill/auto');
}

// Create an SSR-safe storage adapter that completely hides Native modules from Node
let SSRSafeStorage: any = {
  getItem: (key: string) => Promise.resolve(null),
  setItem: (key: string, value: string) => Promise.resolve(),
  removeItem: (key: string) => Promise.resolve(),
};

// If we are NOT in the Node.js SSR process, safely require SecureStore
if (typeof process === 'undefined' || process.release?.name !== 'node') {
  if (Platform.OS === 'web') {
    SSRSafeStorage = {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
    };
  } else {
    const SecureStore = require('expo-secure-store');
    // Default Keychain accessibility (WHEN_UNLOCKED) throws
    // "User interaction is not allowed" (errSecInteractionNotAllowed) the
    // moment anything touches the session token from a background context
    // while the phone is locked — the auto-refresh timer below, a
    // background-task run, or a HealthKit background-delivery sync. All three
    // are real background paths this app already has. AFTER_FIRST_UNLOCK
    // stays readable in the background once the device has been unlocked
    // once since boot, which is the standard fix and still requires a device
    // passcode to have been set at some point — the token isn't readable
    // before first unlock.
    const KEYCHAIN_OPTIONS = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK };
    SSRSafeStorage = {
      getItem: (key: string) => {
        return SecureStore.getItemAsync(key, KEYCHAIN_OPTIONS);
      },
      setItem: (key: string, value: string) => {
        return SecureStore.setItemAsync(key, value, KEYCHAIN_OPTIONS);
      },
      removeItem: (key: string) => {
        return SecureStore.deleteItemAsync(key, KEYCHAIN_OPTIONS);
      },
    };
  }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SSRSafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// supabase-js's autoRefreshToken relies on a JS timer to renew the session
// before it expires. React Native suspends JS timers while the app is
// backgrounded, so without this the timer never gets to fire — the token
// silently expires, and the next auth-dependent call (e.g. getUser()) fails
// with "not authenticated" even though the user never logged out. This is
// Supabase's documented required wiring for React Native.
if (typeof process === 'undefined' || process.release?.name !== 'node') {
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
  }
}

