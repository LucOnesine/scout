import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import { EmptySearch } from '../../../components/EmptySearch';
import { SearchField } from '../../../components/SearchField';
import { SectionLabel } from '../../../components/SectionLabel';
import { useDatabase } from '../../../context/DatabaseContext';
import { cardShadow, fonts, type ThemeColors, themed } from '../../../theme/theme';
import type { CodeItem } from '../../../types';
import { useTheme } from '../../../context/SettingsContext';

export default function CodeListScreen() {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const { codes } = useDatabase();

  const filtered = useMemo(() => {
    const search = query.toLowerCase();
    return codes.filter(
      (code) =>
        code.name.toLowerCase().includes(search) || code.desc.toLowerCase().includes(search),
    );
  }, [codes, query]);

  const renderItem = ({ item }: { item: CodeItem }) => (
    <Pressable
      onPress={() => router.push(`/code/${item.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.desc}
        </Text>
      </View>
      <ChevronRight size={16} color={colors.mutedSoft} />
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader />
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder={t.searchCode}
            />
            <SectionLabel count={query ? filtered.length : undefined}>
              {t.libraryCode}
            </SectionLabel>
          </View>
        }
        ListEmptyComponent={<EmptySearch query={query} />}
      />
    </SafeAreaView>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  header: {
    gap: 14,
    marginBottom: 12,
  },
  separator: {
    height: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...cardShadow,
  },
  cardPressed: {
    opacity: 0.8,
    borderColor: colors.muted,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 23,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.deep,
  },
  desc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.muted,
    marginTop: 2,
  },
}));
