import { StyleSheet, Text, View } from 'react-native';
import { fonts, type ThemeColors, themed } from '../theme/theme';
import { useTheme } from '../context/SettingsContext';

type Props = {
  children: string;
  count?: number;
};

export function SectionLabel({ children, count }: Props) {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{children}</Text>
      {count !== undefined && (
        <Text style={styles.count}>
          {t.resultsCount(count)}
        </Text>
      )}
    </View>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingTop: 4,
  },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  count: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
}));
