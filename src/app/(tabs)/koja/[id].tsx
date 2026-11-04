import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DetailHeader } from '../../../components/AppHeader';
import { Badge } from '../../../components/Badge';
import { useDatabase } from '../../../context/DatabaseContext';
import { useUi } from '../../../context/UiContext';
import { getKojaCover } from '../../../data/kojaImages';
import { mediaImageSource } from '../../../lib/mediaStore';
import { fonts, type ThemeColors, themed } from '../../../theme/theme';
import { useTheme } from '../../../context/SettingsContext';

export default function KojaDetailScreen() {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { kojas } = useDatabase();
  const item = kojas.find((koja) => koja.id === Number(id));
  const { addHistory } = useUi();

  useEffect(() => {
    if (item) {
      addHistory('Koja', t.historyRead(item.title), '📖');
    }
  }, [item, addHistory, t]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/koja');
    }
  };

  if (!item) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <DetailHeader title={t.tabKoja} onBack={goBack} />
        <View style={styles.missing}>
          <Text style={styles.missingText}>{t.kojaNotFound}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const gallery = item.photos
    .map((photo) => mediaImageSource(photo))
    .filter((source): source is NonNullable<typeof source> => source !== null);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <DetailHeader title={item.title} onBack={goBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image
            source={getKojaCover(item.imageKey, item.coverKey)}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(46,16,101,0.1)', 'rgba(46,16,101,0.9)']}
            locations={[0.15, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={styles.tags}>
              {item.tags.map((tag) => (
                <Badge key={tag} backgroundColor="rgba(255,255,255,0.2)" color={colors.white}>
                  {tag}
                </Badge>
              ))}
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.recitCard}>
            <View style={styles.recitHeader}>
              <View style={styles.accent} />
              <Text style={styles.recitLabel}>{t.story}</Text>
            </View>
            <Text style={styles.recitText}>{item.desc}</Text>
            {gallery.length ? (
              <View style={styles.gallery}>
                {gallery.map((source, index) => (
                  <Image
                    key={`gallery-${index}`}
                    source={source}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
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
    paddingBottom: 24,
  },
  hero: {
    height: 208,
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 20,
    lineHeight: 24,
    color: colors.white,
  },
  date: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.mutedSoft,
    marginTop: 4,
  },
  body: {
    padding: 16,
  },
  recitCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.soft,
    padding: 16,
  },
  recitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  accent: {
    width: 4,
    height: 48,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  recitLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
  },
  recitText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  galleryImage: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
}));
