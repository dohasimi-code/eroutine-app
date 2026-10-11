import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Language } from '../i18n';
import { REMINDER_PHRASES, triggersFor, type ReminderTrigger, type Routine } from './routines';

// Local notifications only: scheduled by the phone itself, nothing goes to a server.
const CHANNEL_ID = 'gentle-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureChannel(channelName: string) {
  if (Platform.OS !== 'android') return;
  // Android 13+ only shows the permission prompt once a channel exists.
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: channelName,
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// Asked only when she turns a reminder on, never at first launch.
export async function requestReminderPermission(channelName: string): Promise<boolean> {
  await ensureChannel(channelName);
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const next = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: true } });
  return next.granted;
}

function toTriggerInput(trigger: ReminderTrigger): Notifications.NotificationTriggerInput {
  if (trigger.type === 'daily') {
    return { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: trigger.hour, minute: trigger.minute, channelId: CHANNEL_ID };
  }
  return {
    type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
    weekday: trigger.weekday,
    hour: trigger.hour,
    minute: trigger.minute,
    channelId: CHANNEL_ID,
  };
}

// The app only ever schedules routine reminders, so it is simplest and safest to rebuild
// them all whenever a routine or the language changes.
export async function syncReminders(routines: Routine[], language: Language, channelName: string): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const wanted = routines.flatMap((routine) => triggersFor(routine).map((trigger, index) => ({ routine, trigger, index })));
  if (wanted.length === 0) return;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;
  await ensureChannel(channelName);
  for (const { routine, trigger, index } of wanted) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${routine.id}-${index}`,
      content: { title: routine.name, body: REMINDER_PHRASES[routine.reminder!.phrase][language] },
      trigger: toTriggerInput(trigger),
    });
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
