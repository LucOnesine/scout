import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, CircleQuestionMark, Clock, Settings } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUi } from '../context/UiContext';
import { fonts, type ThemeColors, themed } from '../theme/theme';
import { FleurDeLys } from './FleurDeLys';
import { useTheme } from '../context/SettingsContext';

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

function HeaderAction({
  Icon,
  onPress,
  label,
}: {
  Icon: IconComponent;
  onPress: () => void;
  label: string;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
      hitSlop={6}
      accessibilityLabel={label}
    >
      <Icon size={18} color={colors.muted} strokeWidth={2} />
    </Pressable>
  );
}

export function AppHeader() {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  const { openAide, openHistory, openParams } = useUi();

  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <LinearGradient
          colors={[colors.primaryLight, colors.deep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logo}
        >
          <FleurDeLys size={21} color={colors.white} />
        </LinearGradient>
        <View>
          <Text style={styles.logoText}>K2TH</Text>
          <Text style={styles.logoSub}>Scout</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <HeaderAction Icon={CircleQuestionMark} onPress={openAide} label={t.help} />
        <HeaderAction Icon={Clock} onPress={openHistory} label={t.history} />
        <HeaderAction Icon={Settings} onPress={openParams} label={t.settings} />
      </View>
    </View>
  );
}

export function DetailHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.detailHeader}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.back, pressed && styles.actionPressed]}
        hitSlop={8}
      >
        <ChevronLeft size={22} color={colors.primary} strokeWidth={2.5} />
        <Text style={styles.backText}>{t.back}</Text>
      </Pressable>
      <Text style={styles.detailTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.detailSpacer} />
    </View>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  logoText: {
    fontFamily: fonts.black,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.5,
    color: colors.deep,
  },
  logoSub: {
    fontFamily: fonts.extraBold,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  action: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPressed: {
    opacity: 0.6,
    backgroundColor: colors.soft,
  },
  detailHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 84,
    paddingVertical: 6,
    borderRadius: 10,
  },
  backText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
  },
  detailTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.black,
    fontSize: 14,
    color: colors.deep,
    paddingHorizontal: 4,
  },
  detailSpacer: {
    width: 84,
  },
}));
