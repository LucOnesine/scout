import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, type DimensionValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type ThemeColors, themed } from '../theme/theme';
import { useTheme } from '../context/SettingsContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: DimensionValue;
};

export function BottomSheet({ visible, onClose, children, maxHeight = '76%' }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { maxHeight, paddingBottom: insets.bottom + 20 }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
}));
