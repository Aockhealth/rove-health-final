/**
 * Background health-platform sync — data flows in from Apple Health /
 * Health Connect without her opening the app.
 *
 * Two layers, cross-platform:
 *  - `expo-background-task` (via `expo-task-manager`) is the actual
 *    delivery mechanism on both platforms: an OS-scheduled periodic task
 *    (BGTaskScheduler on iOS, WorkManager on Android) that runs
 *    `syncHealthData` on a best-effort interval the OS controls — this repo
 *    treats "background delivery" as this periodic pull, not a guaranteed
 *    push, because neither OS actually offers the latter to a third-party
 *    app reliably.
 *  - On iOS only, HealthKit's own `enableBackgroundDelivery` +
 *    `subscribeToChanges` (see registerAppleHealthObservers in
 *    appleHealthSync.ts) layers a faster, closer-to-real-time path on top,
 *    while the periodic task above remains the guaranteed floor.
 *
 * The task executor must be defined at module load time, not inside a
 * component — see the import in _layout.tsx, which is what makes this
 * module's top-level `TaskManager.defineTask` call actually run on app
 * start.
 */
import { Platform } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundTask from 'expo-background-task';
import { syncHealthData, isHealthSyncAvailable } from './healthSync';

export const HEALTH_BACKGROUND_SYNC_TASK = 'rove-health-background-sync';

// Matches the "hourly" cadence requested for HealthKit's own background
// delivery below — one consistent expectation across both platforms, not
// that either OS will actually honor it exactly (see BackgroundTaskOptions).
const MINIMUM_INTERVAL_MINUTES = 60;

TaskManager.defineTask(HEALTH_BACKGROUND_SYNC_TASK, async () => {
  try {
    // A short window — this runs periodically, so it only ever needs to
    // catch up on what's arrived since the last run, not re-scan a month.
    await syncHealthData(3);
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (err) {
    console.error('[healthBackgroundSync] background task failed:', err);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/**
 * Call once permissions are confirmed granted (see HealthPlatformSync's
 * handleSync) — registering before authorization exists would just mean the
 * task runs and finds nothing it's allowed to read.
 */
export async function registerHealthBackgroundSync(): Promise<void> {
  if (!(await isHealthSyncAvailable())) return;

  try {
    await BackgroundTask.registerTaskAsync(HEALTH_BACKGROUND_SYNC_TASK, {
      minimumInterval: MINIMUM_INTERVAL_MINUTES,
    });
  } catch (err) {
    console.error('[healthBackgroundSync] registerTaskAsync failed:', err);
  }

  if (Platform.OS === 'ios') {
    const { registerAppleHealthObservers } = await import('./appleHealthSync');
    await registerAppleHealthObservers();
  }
}

/** Call if she turns tracker mode off, or explicitly disconnects sync — no reason to keep waking the app for a signal nobody's reading anymore. */
export async function unregisterHealthBackgroundSync(): Promise<void> {
  try {
    const registered = await TaskManager.isTaskRegisteredAsync(HEALTH_BACKGROUND_SYNC_TASK);
    if (registered) await BackgroundTask.unregisterTaskAsync(HEALTH_BACKGROUND_SYNC_TASK);
  } catch (err) {
    console.error('[healthBackgroundSync] unregisterTaskAsync failed:', err);
  }

  if (Platform.OS === 'ios') {
    const { unregisterAppleHealthObservers } = await import('./appleHealthSync');
    await unregisterAppleHealthObservers();
  }
}
