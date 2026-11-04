import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { fonts, type ThemeColors, themed } from '../../theme/theme';
import { useTheme } from '../../context/SettingsContext';

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize,
}: TextFieldProps) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedSoft}
        accessibilityLabel={label}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

type ChoiceOption<T extends string | number> = {
  value: T;
  label: string;
};

type ChoiceChipsProps<T extends string | number> = {
  label: string;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function ChoiceChips<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: ChoiceChipsProps<T>) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${label} : ${option.label}`}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function AddRowButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.addRow, pressed && styles.addRowPressed]}
    >
      <Text style={styles.addRowText}>+ {label}</Text>
    </Pressable>
  );
}

export function SaveBar({
  label,
  saving,
  onPress,
}: {
  label: string;
  saving: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.saveBar}>
      <Pressable
        onPress={onPress}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.saveButton,
          pressed && styles.saveButtonPressed,
          saving && styles.saveButtonDisabled,
        ]}
      >
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.saveText}>{label}</Text>
        )}
      </Pressable>
    </View>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  sectionBody: {
    gap: 10,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textSoft,
  },
  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.deep,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.soft,
  },
  chipText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.primary,
  },
  addRow: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.mutedSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.soft,
  },
  addRowPressed: {
    backgroundColor: colors.border,
  },
  addRowText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
  },
  saveBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  saveButton: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  saveButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },
}));
