import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Fixed identifiers so re-scheduling (e.g. cycle dates refresh) replaces the
// existing notification instead of stacking duplicates.
const DAILY_TRACKER_REMINDER_ID = 'daily-tracker-reminder';
const PERIOD_REMINDER_ID = 'period-in-2-days-reminder';
const BBT_REMINDER_ID = 'bbt-morning-reminder';

const DAILY_REMINDER_HOUR = 20; // 8pm local time
const DAILY_REMINDER_MINUTE = 30;
const PERIOD_REMINDER_DAYS_BEFORE = 2;
const PERIOD_REMINDER_HOUR = 9; // 9am local time on the reminder day

// Basal temperature is only meaningful taken on waking, before getting out of
// bed — so this one fires much earlier than the general 8:30pm log reminder,
// and is a separate notification rather than a reworded version of it.
const BBT_REMINDER_HOUR = 6;
const BBT_REMINDER_MINUTE = 30;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureNotificationPermissions(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return status === 'granted';
}

// A daily nudge to log today's entry — same reminder every day, so it's
// scheduled once (idempotent thanks to the fixed identifier) rather than
// re-scheduled on every app open.
export async function scheduleDailyTrackerReminder() {
  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  await Notifications.cancelScheduledNotificationAsync(DAILY_TRACKER_REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_TRACKER_REMINDER_ID,
    content: {
      title: "Don't forget to log today",
      body: 'A quick tracker entry helps Rove learn your patterns.',
    },
    // CALENDAR triggers are iOS-only — DAILY is the cross-platform equivalent
    // for a repeating same-time-every-day notification (confirmed via a real
    // Sentry crash: "Trigger of type: calendar is not supported on Android").
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: DAILY_REMINDER_HOUR,
      minute: DAILY_REMINDER_MINUTE,
    },
  });
}

/**
 * Keeps the morning basal-temperature reminder in step with the tracker mode:
 * scheduled while TTC mode is on, cancelled the moment it's switched off.
 *
 * This reminder is load-bearing rather than an engagement nudge — the coverline
 * the ovulation algorithm derives is built from consecutive morning readings,
 * so missed days degrade the detection itself, not just the chart.
 *
 * Safe to call on every app launch: scheduling is idempotent (fixed
 * identifier), and the cancel path deliberately never asks for permission, so
 * a user who isn't trying to conceive is never prompted on our account.
 */
export async function syncBbtReminder(trackerMode: string | null | undefined) {
  if (trackerMode !== 'ttc') {
    await Notifications.cancelScheduledNotificationAsync(BBT_REMINDER_ID).catch(() => {});
    return;
  }

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  await Notifications.cancelScheduledNotificationAsync(BBT_REMINDER_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: BBT_REMINDER_ID,
    content: {
      title: 'Temperature check',
      body: 'Take your basal temperature before you get out of bed, then log it in Rove.',
    },
    // DAILY, not CALENDAR — calendar triggers are iOS-only (see the note on
    // scheduleDailyTrackerReminder above).
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: BBT_REMINDER_HOUR,
      minute: BBT_REMINDER_MINUTE,
    },
  });
}

// Re-schedules the "period in 2 days" reminder against the current predicted
// date. Called whenever the Home screen loads fresh cycle data, so it always
// reflects the latest prediction rather than a stale one-time schedule.
export async function schedulePeriodReminder(nextPeriodDateIso: string | null) {
  await Notifications.cancelScheduledNotificationAsync(PERIOD_REMINDER_ID).catch(() => {});
  if (!nextPeriodDateIso) return;

  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  const nextPeriod = new Date(nextPeriodDateIso);
  const reminderDate = new Date(nextPeriod);
  reminderDate.setDate(reminderDate.getDate() - PERIOD_REMINDER_DAYS_BEFORE);
  reminderDate.setHours(PERIOD_REMINDER_HOUR, 0, 0, 0);

  if (reminderDate.getTime() <= Date.now()) return; // already past — nothing to schedule

  await Notifications.scheduleNotificationAsync({
    identifier: PERIOD_REMINDER_ID,
    content: {
      title: 'Your period is coming up',
      body: `Expected in about ${PERIOD_REMINDER_DAYS_BEFORE} days — a good time to stock up on essentials.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });
}
