import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Only polyfill URL on native devices, NOT in the Node.js SSR background process
if (typeof process === 'undefined' || process.release?.name !== 'node') {
  require('react-native-url-polyfill/auto');
}

// Create an SSR-safe storage adapter that completely hides Native modules from Node
let SSRSafeStorage = {
  getItem: (key: string) => Promise.resolve(null),
  setItem: (key: string, value: string) => Promise.resolve(),
  removeItem: (key: string) => Promise.resolve(),
};

// If we are NOT in the Node.js SSR process, safely require AsyncStorage
if (typeof process === 'undefined' || process.release?.name !== 'node') {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default || require('@react-native-async-storage/async-storage');
  SSRSafeStorage = AsyncStorage;
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

