import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { MESSAGES, type Messages } from '../i18n/messages';
import { cancelDailyReminder, scheduleDailyReminder } from '../lib/notifications';
import { loadSettings, saveSettings } from '../lib/settingsStore';
import { darkColors, lightColors, type ThemeColors } from '../theme/theme';
import type { AppSettings, Language, ThemeMode } from '../types';

type SettingsContextValue = {
  settings: AppSettings;
  colors: ThemeColors;
  t: Messages;
  isDark: boolean;
  update: (patch: Partial<AppSettings>) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setNotifications: (enabled: boolean) => void;
  setReminderTime: (hour: number, minute: number) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const scheme = useColorScheme();

  const isDark =
    settings.themeMode === 'dark' || (settings.themeMode === 'system' && scheme === 'dark');
  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);
  const t = useMemo(() => MESSAGES[settings.language], [settings.language]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((previous) => ({ ...previous, ...patch }));
  }, []);

  const setThemeMode = useCallback(
    (themeMode: ThemeMode) => update({ themeMode }),
    [update],
  );
  const setLanguage = useCallback(
    (language: Language) => update({ language }),
    [update],
  );
  const setNotifications = useCallback(
    (notifications: boolean) => update({ notifications }),
    [update],
  );
  const setReminderTime = useCallback(
    (reminderHour: number, reminderMinute: number) => update({ reminderHour, reminderMinute }),
    [update],
  );

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!settings.notifications) {
      void cancelDailyReminder();
      return;
    }
    void scheduleDailyReminder({
      enabled: settings.notifications,
      language: settings.language,
      hour: settings.reminderHour,
      minute: settings.reminderMinute,
    });
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      colors,
      t,
      isDark,
      update,
      setThemeMode,
      setLanguage,
      setNotifications,
      setReminderTime,
    }),
    [settings, colors, t, isDark, update, setThemeMode, setLanguage, setNotifications, setReminderTime],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useTheme must be used inside SettingsProvider');
  }
  return context;
}

export function useTheme() {
  return useSettingsContext();
}
