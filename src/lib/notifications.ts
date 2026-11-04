import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MESSAGES } from '../i18n/messages';
import type { Language } from '../types';

export type ReminderOptions = {
  enabled: boolean;
  language: Language;
  hour: number;
  minute: number;
};

export const REMINDER_IDENTIFIER = 'k2th-daily-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function areNotificationsAvailable() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/** Demande l'autorisation système; renvoie false si l'utilisateur refuse. */
export async function requestReminderPermission(): Promise<boolean> {
  if (!areNotificationsAvailable()) return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function cancelDailyReminder() {
  if (!areNotificationsAvailable()) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER);
  } catch {
    // aucune notification programmée: rien à annuler
  }
}

export async function scheduleDailyReminder(reminder: ReminderOptions) {
  if (!areNotificationsAvailable() || !reminder.enabled) return;
  await cancelDailyReminder();
  const messages = MESSAGES[reminder.language];
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_IDENTIFIER,
      content: { title: messages.reminderTitle, body: messages.reminderBody },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
      },
    });
  } catch {
    // autorisation révoquée dans les réglages du téléphone: rien à programmer
  }
}
