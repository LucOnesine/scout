import { CircleQuestionMark } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { fonts, type ThemeColors, themed } from '../theme/theme';
import { BottomSheet } from './BottomSheet';
import { SheetHeader } from './SheetHeader';
import type { TextKey } from '../i18n/messages';
import { useTheme } from '../context/SettingsContext';

const AIDE_TOPICS: [TextKey, TextKey][] = [
  ['helpCode', 'helpCodeDesc'],
  ['helpKoja', 'helpKojaDesc'],
  ['helpTeknika', 'helpTeknikaDesc'],
  ['helpHira', 'helpHiraDesc'],
];

const AIDE_ICONS = ['📡', '📖', '🧭', '🎵'];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AideSheet({ visible, onClose }: Props) {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="72%">
      <SheetHeader
        icon={<CircleQuestionMark size={20} color={colors.primary} />}
        title={t.help}
        onClose={onClose}
      />
      <View style={styles.list}>
        {AIDE_ICONS.map((icon, index) => {
          const [titleKey, descKey] = AIDE_TOPICS[index];
          return (
            <View key={titleKey} style={styles.card}>
              <Text style={styles.icon}>{icon}</Text>
              <View style={styles.texts}>
                <Text style={styles.cardTitle}>{t[titleKey] as string}</Text>
                <Text style={styles.cardDesc}>{t[descKey] as string}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text style={styles.footer}>K2TH · {t.appTagline}</Text>
    </BottomSheet>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.soft,
  },
  icon: {
    fontSize: 20,
  },
  texts: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
  },
  cardDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSoft,
    marginTop: 2,
  },
  footer: {
    marginTop: 18,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.mutedSoft,
  },
}));
