import { Search } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { fonts, type ThemeColors, themed } from '../theme/theme';
import { useTheme } from '../context/SettingsContext';

export function EmptySearch({ query }: { query: string }) {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Search size={24} color={colors.mutedSoft} />
      </View>
      <Text style={styles.title}>{t.noResults}</Text>
      <Text style={styles.subtitle}>{t.searchForQuery(query)}</Text>
    </View>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.muted,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.mutedSoft,
    marginTop: 3,
  },
}));
