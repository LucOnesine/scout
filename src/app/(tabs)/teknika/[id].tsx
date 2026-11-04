import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DetailHeader } from '../../../components/AppHeader';
import { useDatabase } from '../../../context/DatabaseContext';
import { useUi } from '../../../context/UiContext';
import { mediaImageSource } from '../../../lib/mediaStore';
import { fonts, type ThemeColors, themed } from '../../../theme/theme';
import { useTheme } from '../../../context/SettingsContext';

export default function TeknikaDetailScreen() {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { techniques } = useDatabase();
  const item = techniques.find((technique) => technique.id === Number(id));
  const { addHistory } = useUi();
  const iconSource = item ? mediaImageSource(item.iconKey) : null;

  useEffect(() => {
    if (item) {
      addHistory('Teknika', t.historyRead(item.name), '🛠️');
    }
  }, [item, addHistory, t]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/teknika');
    }
  };

  if (!item) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <DetailHeader title={t.tabTeknika} onBack={goBack} />
        <View style={styles.missing}>
          <Text style={styles.missingText}>{t.techniqueNotFound}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <DetailHeader title={item.name} onBack={goBack} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primaryLight, colors.deep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {iconSource ? (
            <Image source={iconSource} style={styles.heroIconImage} resizeMode="cover" />
          ) : (
            <Text style={styles.heroIcon}>{item.icon}</Text>
          )}
          <Text style={styles.heroTitle}>{item.name}</Text>
          <View style={styles.heroMeta}>
            <Text style={styles.heroCategory}>{item.cat}</Text>
            <View style={styles.heroLevel}>
              <Text style={styles.heroLevelText}>{item.level}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.descriptionCard}>
          <Text style={styles.sectionLabel}>{t.description}</Text>
          <Text style={styles.description}>{item.desc}</Text>
        </View>

        <View>
          <Text style={[styles.sectionLabel, styles.stepsLabel]}>{t.steps}</Text>
          <View style={styles.steps}>
            {item.steps.map((step, index) => {
              const stepImage = mediaImageSource(step.imageKey);
              return (
                <View key={`step-${index}`} style={styles.stepCard}>
                  <View style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                  {stepImage ? (
                    <Image source={stepImage} style={styles.stepImage} resizeMode="cover" />
                  ) : null}
                </View>
              );
            })}
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
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  hero: {
    borderRadius: 18,
    padding: 20,
  },
  heroIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  heroIconImage: {
    width: 64,
    height: 64,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroTitle: {
    fontFamily: fonts.black,
    fontSize: 20,
    lineHeight: 24,
    color: colors.white,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  heroCategory: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.mutedSoft,
  },
  heroLevel: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroLevelText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.white,
  },
  descriptionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.soft,
    padding: 16,
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 8,
  },
  stepsLabel: {
    marginBottom: 12,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  steps: {
    gap: 8,
  },
  stepCard: {
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: colors.primary,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stepImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    backgroundColor: colors.soft,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontFamily: fonts.black,
    fontSize: 11,
    color: colors.white,
  },
  stepText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },
}));
