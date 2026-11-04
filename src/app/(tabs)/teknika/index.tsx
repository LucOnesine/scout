import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import { EmptySearch } from '../../../components/EmptySearch';
import { SearchField } from '../../../components/SearchField';
import { SectionLabel } from '../../../components/SectionLabel';
import { useDatabase } from '../../../context/DatabaseContext';
import { mediaImageSource } from '../../../lib/mediaStore';
import { cardShadow, fonts, type ThemeColors, themed } from '../../../theme/theme';
import type { TechniqueItem } from '../../../types';
import { useTheme } from '../../../context/SettingsContext';

export default function TeknikaListScreen() {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const { techniques } = useDatabase();

  const filtered = useMemo(() => {
    const search = query.toLowerCase();
    return techniques.filter(
      (technique) =>
        technique.name.toLowerCase().includes(search) ||
        technique.cat.toLowerCase().includes(search) ||
        technique.level.toLowerCase().includes(search) ||
        technique.desc.toLowerCase().includes(search),
    );
  }, [techniques, query]);

  const renderItem = ({ item }: { item: TechniqueItem }) => {
    const iconSource = mediaImageSource(item.iconKey);
    return (
      <Pressable
        onPress={() => router.push(`/teknika/${item.id}`)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.iconBox}>
          {iconSource ? (
            <Image source={iconSource} style={styles.iconImage} resizeMode="cover" />
          ) : (
            <Text style={styles.icon}>{item.icon}</Text>
          )}
        </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.category}>{item.cat}</Text>
          <View style={[styles.level, { backgroundColor: `${item.levelColor}22` }]}>
            <Text style={[styles.levelText, { color: item.levelColor }]}>{item.level}</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={16} color={colors.mutedSoft} />
    </Pressable>
    );
  };

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
              placeholder={t.searchTeknika}
            />
            <SectionLabel count={query ? filtered.length : undefined}>
              {t.libraryTeknika}
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
    gap: 12,
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
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 21,
  },
  iconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.deep,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  category: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  level: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelText: {
    fontFamily: fonts.bold,
    fontSize: 10,
  },
}));
