import AsyncStorage from '@react-native-async-storage/async-storage';

export const INTRO_SEEN_KEY = 'rove_has_seen_intro';

export async function hasSeenIntro(): Promise<boolean> {
  return (await AsyncStorage.getItem(INTRO_SEEN_KEY)) === 'true';
}

export async function markIntroSeen(): Promise<void> {
  await AsyncStorage.setItem(INTRO_SEEN_KEY, 'true');
}
