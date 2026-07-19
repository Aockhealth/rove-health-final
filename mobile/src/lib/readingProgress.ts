import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'rove:learn:progress:';

export async function getReadingProgress(articleId: string): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(KEY_PREFIX + articleId);
    return value ? Number(value) : 0;
  } catch {
    return 0;
  }
}

export async function setReadingProgress(articleId: string, pct: number) {
  try {
    await AsyncStorage.setItem(KEY_PREFIX + articleId, String(Math.round(Math.max(0, Math.min(100, pct)))));
  } catch {
    // best-effort only — reading progress is a nice-to-have, never block on it
  }
}

export async function getAllReadingProgress(ids: string[]): Promise<Record<string, number>> {
  if (ids.length === 0) return {};
  try {
    const pairs = await AsyncStorage.multiGet(ids.map((id) => KEY_PREFIX + id));
    const result: Record<string, number> = {};
    pairs.forEach(([key, value]) => {
      const id = key.replace(KEY_PREFIX, '');
      result[id] = value ? Number(value) : 0;
    });
    return result;
  } catch {
    return {};
  }
}
