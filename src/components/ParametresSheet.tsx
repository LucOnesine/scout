import { LinearGradient } from 'expo-linear-gradient';
import { Check, ChevronLeft, ChevronRight, Mail, Phone, Settings, User } from 'lucide-react-native';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { LANGUAGE_LABELS } from '../i18n/messages';
import { areNotificationsAvailable, requestReminderPermission } from '../lib/notifications';
import { fonts, themed, type ThemeColors } from '../theme/theme';
import type { Language, ThemeMode } from '../types';
import { BottomSheet } from './BottomSheet';
import { FleurDeLys } from './FleurDeLys';
import { SheetHeader } from './SheetHeader';
import { useTheme } from '../context/SettingsContext';

const THEME_MODES: ThemeMode[] = ['system', 'light', 'dark'];
const LANGUAGES: Language[] = ['fr', 'mg', 'en'];
const MINUTE_STEP = 5;

function Stepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (step: number) => void;
  label: string;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(-1)}
        hitSlop={8}
        style={styles.stepButton}
        accessibilityRole="button"
        accessibilityLabel={`${label} −1`}
      >
        <ChevronLeft size={16} color={colors.primary} strokeWidth={2.5} />
      </Pressable>
      <Text style={styles.stepValue}>{String(value).padStart(2, '0')}</Text>
      <Pressable
        onPress={() => onChange(1)}
        hitSlop={8}
        style={styles.stepButton}
        accessibilityRole="button"
        accessibilityLabel={`${label} +1`}
      >
        <ChevronRight size={16} color={colors.primary} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Pressable
      onPress={onChange}
      style={[styles.track, value ? styles.trackOn : styles.trackOff]}
      hitSlop={8}
    >
      <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ParametresSheet({ visible, onClose }: Props) {
  const {
    colors,
    t,
    settings,
    setThemeMode,
    setLanguage,
    setNotifications,
    setReminderTime,
  } = useTheme();
  const styles = makeStyles(colors);

  const enableNotifications = async () => {
    if (settings.notifications) {
      setNotifications(false);
      return;
    }
    if (await requestReminderPermission()) {
      setNotifications(true);
    } else {
      Alert.alert(t.notificationsBlocked, t.notificationsBlockedBody);
    }
  };

  const shiftHour = (step: number) =>
    setReminderTime((settings.reminderHour + step + 24) % 24, settings.reminderMinute);

  const shiftMinute = (step: number) => {
    const total = settings.reminderHour * 60 + settings.reminderMinute + step * MINUTE_STEP;
    const wrapped = (total + 1440) % 1440;
    setReminderTime(Math.floor(wrapped / 60), wrapped % 60);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="82%">
      <SheetHeader
        icon={<Settings size={20} color={colors.primary} />}
        title={t.settings}
        onClose={onClose}
      />

      <Text style={styles.section}>{t.themeMode}</Text>
      <View style={styles.segment}>
        {THEME_MODES.map((mode) => {
          const isActive = settings.themeMode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => setThemeMode(mode)}
              style={[styles.segmentItem, isActive && styles.segmentItemActive]}
              accessibilityRole="button"
            >
              <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                {mode === 'system' ? t.themeSystem : mode === 'light' ? t.themeLight : t.themeDark}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>{t.language}</Text>
      <View style={styles.group}>
        {LANGUAGES.map((language) => (
          <Pressable
            key={language}
            onPress={() => setLanguage(language)}
            style={styles.row}
            accessibilityRole="button"
          >
            <Text style={styles.rowLabel}>{LANGUAGE_LABELS[language]}</Text>
            {settings.language === language && (
              <Check size={16} color={colors.primary} strokeWidth={2.5} />
            )}
          </Pressable>
        ))}
      </View>

      {areNotificationsAvailable() && (
        <>
          <Text style={styles.section}>{t.notifications}</Text>
          <View style={styles.group}>
            <View style={styles.row}>
              <View style={styles.rowTexts}>
                <Text style={styles.rowLabel}>{t.dailyReminder}</Text>
                <Text style={styles.rowHint}>{t.reminderHint}</Text>
              </View>
              <Toggle
                value={settings.notifications}
                onChange={() => {
                  void enableNotifications();
                }}
              />
            </View>
            {settings.notifications && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{t.reminderTime}</Text>
                <View style={styles.timeRow}>
                  <Stepper
                    value={settings.reminderHour}
                    onChange={shiftHour}
                    label={t.reminderTime}
                  />
                  <Text style={styles.timeSeparator}>:</Text>
                  <Stepper
                    value={settings.reminderMinute}
                    onChange={shiftMinute}
                    label={t.reminderTime}
                  />
                </View>
              </View>
            )}
          </View>
        </>
      )}

      <Text style={styles.section}>{t.contact}</Text>
      <View style={styles.group}>
        <View style={styles.row}>
          <View style={styles.contactRow}>
            <User size={16} color={colors.primary} />
            <Text style={styles.rowLabel}>{t.ownerName}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => {
            void Linking.openURL(`mailto:${t.ownerEmail}`);
          }}
          style={styles.row}
          accessibilityRole="button"
        >
          <View style={styles.contactRow}>
            <Mail size={16} color={colors.primary} />
            <Text style={styles.rowValue}>{t.ownerEmail}</Text>
          </View>
          <ChevronRight size={16} color={colors.mutedSoft} />
        </Pressable>
        <Pressable
          onPress={() => {
            void Linking.openURL(`tel:${t.ownerPhone}`);
          }}
          style={styles.row}
          accessibilityRole="button"
        >
          <View style={styles.contactRow}>
            <Phone size={16} color={colors.primary} />
            <Text style={styles.rowValue}>{t.ownerPhone}</Text>
          </View>
          <ChevronRight size={16} color={colors.mutedSoft} />
        </Pressable>
      </View>

      <Text style={styles.section}>{t.about}</Text>
      <LinearGradient
        colors={[colors.primaryLight, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.about}
      >
        <View style={styles.logo}>
          <FleurDeLys size={24} color={colors.white} />
        </View>
        <Text style={styles.aboutTitle}>K2TH</Text>
        <Text style={styles.aboutVersion}>{t.version}</Text>
        <Text style={styles.aboutSub}>{t.appTagline}</Text>
      </LinearGradient>
    </BottomSheet>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  section: {
    fontFamily: fonts.extraBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 8,
    marginTop: 6,
  },
  group: {
    gap: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.soft,
  },
  rowLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  rowTexts: {
    flex: 1,
    gap: 2,
    paddingRight: 12,
  },
  rowHint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.muted,
  },
  rowValue: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textSoft,
  },
  contactRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  segment: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.soft,
    marginBottom: 12,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.muted,
  },
  segmentTextActive: {
    color: colors.onPrimary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timeSeparator: {
    fontFamily: fonts.black,
    fontSize: 14,
    color: colors.muted,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  stepButton: {
    width: 26,
    height: 26,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.border,
  },
  stepValue: {
    fontFamily: fonts.black,
    fontSize: 15,
    color: colors.deep,
    minWidth: 26,
    textAlign: 'center',
  },
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 4,
  },
  trackOn: {
    backgroundColor: colors.primary,
  },
  trackOff: {
    backgroundColor: colors.grayLight,
  },
  knob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
  knobOff: {
    alignSelf: 'flex-start',
  },
  about: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  aboutTitle: {
    fontFamily: fonts.black,
    fontSize: 18,
    color: colors.white,
  },
  aboutVersion: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
    marginTop: 3,
  },
  aboutSub: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.white,
    opacity: 0.65,
    marginTop: 6,
  },
}));
