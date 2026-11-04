import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeftRight, Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DetailHeader } from '../../../components/AppHeader';
import { useDatabase } from '../../../context/DatabaseContext';
import { useUi } from '../../../context/UiContext';
import { fromMorse, toMorse } from '../../../lib/morse';
import { fonts, mono, type ThemeColors, themed } from '../../../theme/theme';
import type { CodeItem } from '../../../types';
import { useTheme } from '../../../context/SettingsContext';

type Cell = CodeItem['table'][number];

const chunkRows = (table: Cell[], size: number): (Cell | null)[][] => {
  const rows: (Cell | null)[][] = [];
  for (let index = 0; index < table.length; index += size) {
    const row: (Cell | null)[] = table.slice(index, index + size);
    while (row.length < size) {
      row.push(null);
    }
    rows.push(row);
  }
  return rows;
};

type TransformMode = 'text-to-code' | 'code-to-text';

export default function CodeDetailScreen() {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { codes } = useDatabase();
  const item = codes.find((code) => code.id === Number(id));
  const { addHistory } = useUi();

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<TransformMode>('text-to-code');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (item) {
      addHistory('Code', t.historyViewed(item.name), '📡');
    }
  }, [item, addHistory, t]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/code');
    }
  };

  if (!item) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <DetailHeader title={t.tabCode} onBack={goBack} />
        <View style={styles.missing}>
          <Text style={styles.missingText}>{t.codeNotFound}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const transform = () => {
    if (item.type === 'morse') {
      setOutput(
        mode === 'text-to-code'
          ? toMorse(input, item.table)
          : fromMorse(input, item.table),
      );
    } else {
      setOutput(`[Transformation ${mode === 'text-to-code' ? '→ Code' : '→ Texte'}: ${input}]`);
    }
  };

  const rows = chunkRows(item.table, 4);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <DetailHeader title={item.name} onBack={goBack} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Text style={styles.introIcon}>{item.icon}</Text>
            <View style={styles.introTexts}>
              <Text style={styles.introName}>{item.name}</Text>
              <Text style={styles.introDesc}>{item.desc}</Text>
            </View>
          </View>

          <View style={styles.table}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, cellIndex) => (
                  <View key={cell ? cell.l : `empty-${cellIndex}`} style={styles.cell}>
                    {cell && (
                      <>
                        <Text style={styles.cellLetter}>{cell.l}</Text>
                        <Text style={styles.cellCode}>{cell.c}</Text>
                      </>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.panel}>
          <View style={styles.segmented}>
            <Pressable
              onPress={() => setMode('text-to-code')}
              style={[styles.segment, mode === 'text-to-code' && styles.segmentActive]}
            >
              <Text
                style={[styles.segmentText, mode === 'text-to-code' && styles.segmentTextActive]}
              >
                Texte → Code
              </Text>
            </Pressable>
            <ArrowLeftRight size={14} color={colors.muted} />
            <Pressable
              onPress={() => setMode('code-to-text')}
              style={[styles.segment, mode === 'code-to-text' && styles.segmentActive]}
            >
              <Text
                style={[styles.segmentText, mode === 'code-to-text' && styles.segmentTextActive]}
              >
                Code → Texte
              </Text>
            </Pressable>
          </View>

          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={
              mode === 'text-to-code'
                ? t.encodeHint
                : t.decodeHint
            }
            placeholderTextColor={colors.mutedSoft}
            accessibilityLabel={
              mode === 'text-to-code'
                ? t.encodeAria
                : t.decodeAria
            }
            multiline
            style={styles.input}
          />

          {output.length > 0 && (
            <View style={styles.output}>
              <Text style={styles.outputLabel}>{t.result}</Text>
              <Text style={styles.outputText}>{output}</Text>
            </View>
          )}

          <Pressable
            onPress={transform}
            style={({ pressed }) => [styles.validate, pressed && styles.validatePressed]}
          >
            <Check size={16} color={colors.white} strokeWidth={2.5} />
            <Text style={styles.validateText}>{t.validate}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: {
    flex: 1,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingText: {
    fontFamily: fonts.bold,
    color: colors.muted,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  introIcon: {
    fontSize: 26,
  },
  introTexts: {
    flex: 1,
  },
  introName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.deep,
  },
  introDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.muted,
    marginTop: 1,
  },
  table: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  cell: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.soft,
  },
  cellLetter: {
    fontFamily: fonts.black,
    fontSize: 16,
    color: colors.deep,
  },
  cellCode: {
    fontFamily: mono,
    fontSize: 9,
    textAlign: 'center',
    color: colors.primaryDark,
    marginTop: 3,
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    padding: 16,
    gap: 10,
  },
  segmented: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
    borderRadius: 16,
    backgroundColor: colors.soft,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  segmentActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.primary,
  },
  segmentTextActive: {
    color: colors.white,
  },
  input: {
    height: 64,
    padding: 12,
    paddingTop: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.soft,
    fontFamily: mono,
    fontSize: 12,
    color: colors.deep,
    textAlignVertical: 'top',
  },
  output: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.deep,
  },
  outputLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 4,
  },
  outputText: {
    fontFamily: mono,
    fontSize: 12,
    lineHeight: 18,
    color: colors.border,
  },
  validate: {
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  validatePressed: {
    backgroundColor: colors.primaryDark,
  },
  validateText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.white,
  },
}));
