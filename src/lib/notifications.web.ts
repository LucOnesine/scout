import type { ReminderOptions } from './notifications';

export const REMINDER_IDENTIFIER = 'k2th-daily-reminder';

export function areNotificationsAvailable() {
  return false;
}

export async function requestReminderPermission(): Promise<boolean> {
  return false;
}

export async function cancelDailyReminder() {}

export async function scheduleDailyReminder(_reminder: ReminderOptions) {}
