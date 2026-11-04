import { StyleSheet, Text, View } from 'react-native';
import { fonts, themed, type ThemeColors } from '../theme/theme';
import { useTheme } from '../context/SettingsContext';

type Props = {
  children: string;
  backgroundColor?: string;
  color?: string;
};

export function Badge({ children, backgroundColor, color }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={[styles.badge, { backgroundColor: backgroundColor ?? colors.border }]}>
      <Text style={[styles.text, { color: color ?? colors.primaryDark }]}>{children}</Text>
    </View>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
}));
