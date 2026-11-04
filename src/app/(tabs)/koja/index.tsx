import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import { Badge } from '../../../components/Badge';
import { EmptySearch } from '../../../components/EmptySearch';
import { SearchField } from '../../../components/SearchField';
import { SectionLabel } from '../../../components/SectionLabel';
import { useDatabase } from '../../../context/DatabaseContext';
import { getKojaCover } from '../../../data/kojaImages';
import { cardShadow, fonts, type ThemeColors, themed } from '../../../theme/theme';
import type { KojaItem } from '../../../types';
import { useTheme } from '../../../context/SettingsContext';

export default function KojaListScreen() {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  const [query, setQuery] = useState('');
  const { kojas } = useDatabase();

  const filtered = useMemo(() => {
    const search = query.toLowerCase();
    return kojas.filter(
      (koja) =>
        koja.title.toLowerCase().includes(search) ||
        koja.desc.toLowerCase().includes(search) ||
        koja.date.toLowerCase().includes(search) ||
        koja.tags.some((tag) => tag.toLowerCase().includes(search)),
    );
  }, [kojas, query]);

  const renderItem = ({ item }: { item: KojaItem }) => (
    <Pressable
      onPress={() => router.push(`/koja/${item.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={getKojaCover(item.imageKey, item.coverKey)}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(46,16,101,0.82)']}
          locations={[0.3, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.overlay}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.tags}>
        {item.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </View>
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
              placeholder={t.searchKoja}
            />
            <SectionLabel count={query ? filtered.length : undefined}>
              {t.libraryKoja}
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
    marginBottom: 16,
  },
  separator: {
    height: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...cardShadow,
  },
  cardPressed: {
    opacity: 0.85,
    borderColor: colors.muted,
  },
  imageWrap: {
    height: 128,
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 9,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 14,
    lineHeight: 17,
    color: colors.white,
  },
  date: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.mutedSoft,
    marginTop: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 12,
  },
}));
