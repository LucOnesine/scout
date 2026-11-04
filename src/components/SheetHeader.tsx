import type { ReactNode } from 'react';
import { X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, type ThemeColors, themed } from '../theme/theme';
import { useTheme } from '../context/SettingsContext';

type Props = {
  icon: ReactNode;
  title: string;
  onClose: () => void;
  action?: ReactNode;
};

export function SheetHeader({ icon, title, onClose, action }: Props) {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.row}>
      <View style={styles.titleRow}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.actions}>
        {action}
        <Pressable
          onPress={onClose}
          style={styles.close}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t.close}
        >
          <X size={16} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 16,
    color: colors.deep,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
