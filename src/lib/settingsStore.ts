import { File, Paths } from 'expo-file-system';
import type { AppSettings, ThemeMode } from '../types';

const SETTINGS_FILE_NAME = 'k2th-settings.json';

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  language: 'fr',
  notifications: false,
  reminderHour: 20,
  reminderMinute: 0,
};

function settingsFile() {
  return new File(Paths.document, SETTINGS_FILE_NAME);
}

export function loadSettings(): AppSettings {
  try {
    const file = settingsFile();
    if (!file.exists) return DEFAULT_SETTINGS;
    const raw = JSON.parse(file.textSync()) as Partial<AppSettings>;
    return {
      themeMode: (['system', 'light', 'dark'] as ThemeMode[]).includes(raw.themeMode as ThemeMode)
        ? (raw.themeMode as ThemeMode)
        : DEFAULT_SETTINGS.themeMode,
      language: raw.language === 'mg' || raw.language === 'en' || raw.language === 'fr'
        ? raw.language
        : DEFAULT_SETTINGS.language,
      notifications: typeof raw.notifications === 'boolean' ? raw.notifications : DEFAULT_SETTINGS.notifications,
      reminderHour: clamp(raw.reminderHour, 0, 23, DEFAULT_SETTINGS.reminderHour),
      reminderMinute: clamp(raw.reminderMinute, 0, 59, DEFAULT_SETTINGS.reminderMinute),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    const file = settingsFile();
    file.create({ intermediates: true, overwrite: true });
    file.writeSync(JSON.stringify(settings));
  } catch {
    // Les réglages restent en mémoire si l'écriture du fichier échoue.
  }
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const num = Number(value);
  if (!Number.isInteger(num) || num < min || num > max) return fallback;
  return num;
}
