import type { AppSettings, ThemeMode } from '../types';

const SETTINGS_STORAGE_KEY = 'k2th-settings';

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  language: 'fr',
  notifications: false,
  reminderHour: 20,
  reminderMinute: 0,
};

function store() {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

export function loadSettings(): AppSettings {
  const storage = store();
  if (!storage) return DEFAULT_SETTINGS;
  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    return {
      themeMode: modes.includes(parsed.themeMode as ThemeMode)
        ? (parsed.themeMode as ThemeMode)
        : DEFAULT_SETTINGS.themeMode,
      language: parsed.language === 'mg' || parsed.language === 'en' || parsed.language === 'fr'
        ? parsed.language
        : DEFAULT_SETTINGS.language,
      notifications: false,
      reminderHour: DEFAULT_SETTINGS.reminderHour,
      reminderMinute: DEFAULT_SETTINGS.reminderMinute,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    store()?.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // stockage indisponible: les réglages restent en mémoire
  }
}
