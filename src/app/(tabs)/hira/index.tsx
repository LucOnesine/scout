import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Play } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import { EmptySearch } from '../../../components/EmptySearch';
import { SearchField } from '../../../components/SearchField';
import { SectionLabel } from '../../../components/SectionLabel';
import { useDatabase } from '../../../context/DatabaseContext';
import { cardShadow, fonts, type ThemeColors, themed } from '../../../theme/theme';
import type { ChantItem } from '../../../types';
import { useTheme } from '../../../context/SettingsContext';

export default function HiraListScreen() {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const { chants } = useDatabase();

  const filtered = useMemo(() => {
    const search = query.toLowerCase();
    return chants.filter(
      (chant) =>
        chant.title.toLowerCase().includes(search) ||
        chant.artist.toLowerCase().includes(search) ||
        chant.genre.toLowerCase().includes(search) ||
        chant.lyrics.toLowerCase().includes(search),
    );
  }, [chants, query]);

  const renderItem = ({ item }: { item: ChantItem }) => {
    const index = chants.findIndex((chant) => chant.id === item.id);
    const [from, to] = item.gradient;

    return (
      <Pressable
        onPress={() => router.push(`/hira/${item.id}`)}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <LinearGradient
          colors={[from, to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.number}
        >
          <Text style={styles.numberText}>{index + 1}</Text>
        </LinearGradient>
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>
            {item.artist} · {item.dur}
          </Text>
          <Text style={styles.genre}>{item.genre}</Text>
        </View>
        <View style={styles.play}>
          <Play size={14} color={colors.primary} fill={colors.primary} />
        </View>
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
              placeholder={t.searchHira}
            />
            <SectionLabel count={query ? filtered.length : undefined}>
              {t.libraryHira}
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
  number: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontFamily: fonts.black,
    fontSize: 14,
    color: colors.white,
  },
  info: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.deep,
  },
  meta: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  genre: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.mutedSoft,
    marginTop: 3,
  },
  play: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
