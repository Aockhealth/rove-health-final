/**
 * Platform-agnostic entry point for health-platform sync. The UI should
 * only ever import from here, never from ./healthConnectSync or
 * ./appleHealthSync directly — importing the wrong platform's native
 * module crashes on the other OS.
 *
 * Foreground-triggered on both directions (no background delivery yet). The
 * read direction pulls BBT/sleep/fertility-test/period signals in; the write
 * direction (writeHealthData) pushes back only BBT and period/flow — never
 * symptoms, moods, or anything else Rove collects. See
 * docs/react-native-migration-team-plan.md — this is a dev-client-only
 * feature; it does not run in Expo Go.
 */
import { Platform, Linking } from 'react-native';
import type { SyncWriteResult } from './healthSyncWriter';
import type { FlowIntensity } from '@shared/health/platformMapping';

export type HealthPlatformLabel = 'Apple Health' | 'Health Connect' | null;

export function healthPlatformLabel(): HealthPlatformLabel {
  if (Platform.OS === 'ios') return 'Apple Health';
  if (Platform.OS === 'android') return 'Health Connect';
  return null;
}

export async function isHealthSyncAvailable(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const { isAppleHealthAvailable } = await import('./appleHealthSync');
    return isAppleHealthAvailable();
  }
  if (Platform.OS === 'android') {
    const { isHealthConnectAvailable } = await import('./healthConnectSync');
    return isHealthConnectAvailable();
  }
  return false;
}

export async function requestHealthSyncPermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const { requestAppleHealthPermissions } = await import('./appleHealthSync');
    return requestAppleHealthPermissions();
  }
  if (Platform.OS === 'android') {
    const { requestHealthConnectPermissions } = await import('./healthConnectSync');
    return requestHealthConnectPermissions();
  }
  return false;
}

/**
 * Sends her directly to where she can grant access herself — Health
 * Connect's own per-app permissions screen on Android; the app's Settings
 * page on iOS, since Apple has no equivalent direct deep link into Health's
 * per-app permission screen from a third-party app.
 */
export async function openHealthPlatformSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    const { openHealthConnectSettings } = await import('./healthConnectSync');
    openHealthConnectSettings();
    return;
  }
  if (Platform.OS === 'ios') {
    await Linking.openSettings();
  }
}

export async function syncHealthData(days = 30): Promise<SyncWriteResult> {
  if (Platform.OS === 'ios') {
    const { syncAppleHealthData } = await import('./appleHealthSync');
    return syncAppleHealthData(days);
  }
  if (Platform.OS === 'android') {
    const { syncHealthConnectData } = await import('./healthConnectSync');
    return syncHealthConnectData(days);
  }
  return { daysConsidered: 0, fieldsWritten: 0, fieldsSkippedExisting: 0 };
}

/**
 * Pushes one day's BBT/period entry back to Apple Health / Health Connect.
 * Fire-and-forget from the tracker save path (see logTtcQuickEntry and
 * logDailySymptoms in tracker.ts) — a failed or unauthorized write is
 * swallowed inside the platform module, never surfaced as an error on the
 * save the user is actually looking at.
 *
 * No-ops on a platform without HealthKit/Health Connect installed at all
 * (isHealthSyncAvailable false). Actual write-authorization gating happens
 * per-platform inside writeAppleHealthData/writeHealthConnectData.
 */
export async function writeHealthData(entry: {
  date: string;
  bbtCelsius?: number | null;
  isPeriod?: boolean | null;
  /** Whether `date` is the first day of a new period streak — feeds HealthKit's HKMenstrualCycleStart metadata on iOS. */
  isPeriodStart?: boolean;
  flowIntensity?: FlowIntensity | null;
}): Promise<void> {
  if (!(await isHealthSyncAvailable())) return;

  if (Platform.OS === 'ios') {
    const { writeAppleHealthData } = await import('./appleHealthSync');
    return writeAppleHealthData(entry);
  }
  if (Platform.OS === 'android') {
    const { writeHealthConnectData } = await import('./healthConnectSync');
    return writeHealthConnectData(entry);
  }
}
