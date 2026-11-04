import { Clock, Trash2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { HistoryEntry } from '../types';
import { fonts, type ThemeColors, themed } from '../theme/theme';
import { Badge } from './Badge';
import { BottomSheet } from './BottomSheet';
import { SheetHeader } from './SheetHeader';
import { useTheme } from '../context/SettingsContext';

type Props = {
  visible: boolean;
  historique: HistoryEntry[];
  onDelete: (id: number) => void;
  onClear: () => void;
  onClose: () => void;
};

export function HistoriqueSheet({ visible, historique, onDelete, onClear, onClose }: Props) {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="72%">
      <SheetHeader
        icon={<Clock size={20} color={colors.primary} />}
        title={t.history}
        onClose={onClose}
        action={
          historique.length > 0 ? (
            <Pressable onPress={onClear} hitSlop={8}>
              <Text style={styles.clear}>{t.clearAll}</Text>
            </Pressable>
          ) : undefined
        }
      />

      {historique.length === 0 ? (
        <View style={styles.empty}>
          <Clock size={32} color={colors.border} />
          <Text style={styles.emptyText}>{t.historyEmpty}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {historique.map((entry) => (
            <View key={entry.id} style={styles.entry}>
              <Text style={styles.entryIcon}>{entry.icon}</Text>
              <View style={styles.entryBody}>
                <Text style={styles.entryAction}>{entry.action}</Text>
                <View style={styles.entryMeta}>
                  <Badge>{entry.type}</Badge>
                  <Text style={styles.entryTime}>{entry.time}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => onDelete(entry.id)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`${t.delete} ${entry.action}`}
              >
                <Trash2 size={15} color={colors.danger} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  clear: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.danger,
    paddingHorizontal: 4,
  },
  list: {
    gap: 8,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.soft,
  },
  entryIcon: {
    fontSize: 20,
  },
  entryBody: {
    flex: 1,
  },
  entryAction: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  entryTime: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
    marginTop: 8,
  },
}));
