import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DetailHeader } from '../../../components/AppHeader';
import { Badge } from '../../../components/Badge';
import { useDatabase } from '../../../context/DatabaseContext';
import { useUi } from '../../../context/UiContext';
import { mediaAudioSource } from '../../../lib/mediaStore';
import { fonts, type ThemeColors, themed } from '../../../theme/theme';
import { useTheme } from '../../../context/SettingsContext';

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export default function HiraDetailScreen() {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { chants } = useDatabase();
  const item = chants.find((chant) => chant.id === Number(id));
  const { addHistory } = useUi();

  const audioSource = item ? mediaAudioSource(item.audioKey) : null;
  const hasAudio = audioSource !== null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);

  const totalSeconds = useMemo(() => {
    if (!item) return 0;
    return item.dur.split(':').reduce((total, part) => total * 60 + parseInt(part, 10), 0);
  }, [item]);

  useEffect(() => {
    if (item) {
      addHistory('Hira', t.historyListened(item.title), '🎵');
    }
  }, [item, addHistory, t]);

  const audioPlayer = useAudioPlayer(audioSource);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isPlaying || hasAudio || totalSeconds === 0) return;
    const timer = setInterval(() => {
      setProgress((previous) => {
        const next = previous + 100 / totalSeconds;
        return next >= 100 ? 0 : next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, hasAudio, totalSeconds]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/hira');
    }
  };

  if (!item) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <DetailHeader title={t.tabHira} onBack={goBack} />
        <View style={styles.missing}>
          <Text style={styles.missingText}>{t.chantNotFound}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const durationSeconds = hasAudio ? audioStatus.duration || 0 : totalSeconds;
  const playIndicator = hasAudio ? audioStatus.playing : isPlaying;
  const fillPercent = hasAudio
    ? durationSeconds > 0
      ? Math.min(100, (audioStatus.currentTime / durationSeconds) * 100)
      : 0
    : progress;
  const elapsed = hasAudio
    ? Math.floor(audioStatus.currentTime)
    : Math.floor((totalSeconds * progress) / 100);

  const togglePlay = () => {
    if (hasAudio) {
      if (audioStatus.playing) {
        audioPlayer.pause();
      } else {
        audioPlayer.play();
      }
      return;
    }
    if (!isPlaying && progress >= 100) {
      setProgress(0);
    }
    setIsPlaying((playing) => !playing);
  };

  const seekToRatio = (ratio: number) => {
    if (hasAudio && audioStatus.duration > 0) {
      void audioPlayer.seekTo(Math.max(0, Math.min(1, ratio)) * audioStatus.duration);
    } else {
      setProgress(Math.max(0, Math.min(100, ratio * 100)));
    }
  };

  const seek = (event: GestureResponderEvent) => {
    if (!trackWidth) return;
    seekToRatio(event.nativeEvent.locationX / trackWidth);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <DetailHeader title={item.title} onBack={goBack} />

      <View style={styles.body}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[colors.primary, colors.ink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroIcon}>
              <Music size={28} color={colors.white} />
            </View>
            <Text style={styles.heroTitle}>{item.title}</Text>
            <Text style={styles.heroArtist}>{item.artist}</Text>
            <View style={styles.heroMeta}>
              <Badge backgroundColor="rgba(255,255,255,0.2)" color={colors.white}>
                {item.genre}
              </Badge>
              <Text style={styles.heroDuration}>{item.dur}</Text>
            </View>
          </LinearGradient>

          <View style={styles.lyricsCard}>
            <Text style={styles.lyricsLabel}>{t.lyrics}</Text>
            <View>
              {item.lyrics.split('\n').map((line, index) =>
                line.startsWith('—') ? (
                  <Text key={index} style={styles.sectionLine}>
                    {line}
                  </Text>
                ) : line === '' ? (
                  <View key={index} style={styles.spacer} />
                ) : (
                  <Text key={index} style={styles.lyricLine}>
                    {line}
                  </Text>
                ),
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.player}>
          <View>
            <Pressable
              onPress={seek}
              onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
              style={styles.track}
              hitSlop={8}
              accessibilityRole="adjustable"
              accessibilityLabel="Position de lecture"
            >
              <View style={[styles.trackFill, { width: `${fillPercent}%` }]} />
              <View style={[styles.thumb, { left: `${fillPercent}%` }]} />
            </Pressable>
            <View style={styles.times}>
              <Text style={styles.time}>{formatTime(elapsed)}</Text>
              <Text style={styles.time}>
                {hasAudio ? formatTime(durationSeconds) : item.dur}
              </Text>
            </View>
          </View>

          <View style={styles.controls}>
            <Pressable
              onPress={() => seekToRatio(0)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Revenir au début"
            >
              <SkipBack size={24} color={colors.mutedSoft} />
            </Pressable>
            <Pressable
              onPress={togglePlay}
              style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel={playIndicator ? t.pause : t.play}
            >
              {playIndicator ? (
                <Pause size={24} color={colors.white} fill={colors.white} />
              ) : (
                <Play size={24} color={colors.white} fill={colors.white} style={styles.playIcon} />
              )}
            </Pressable>
            <Pressable
              onPress={() => (hasAudio ? seekToRatio(1) : setProgress(100))}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Aller à la fin"
            >
              <SkipForward size={24} color={colors.mutedSoft} />
            </Pressable>
          </View>

          <View style={styles.volume}>
            <Volume2 size={14} color={colors.mutedSoft} />
            <View style={styles.volumeTrack}>
              <View style={styles.volumeFill} />
            </View>
          </View>
        </View>
      </View>
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
  body: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 12,
    gap: 14,
  },
  hero: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: fonts.black,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
  },
  heroArtist: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.mutedSoft,
    marginTop: 4,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  heroDuration: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.mutedSoft,
  },
  lyricsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.soft,
    padding: 16,
  },
  lyricsLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 10,
  },
  lyricLine: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  sectionLine: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
    marginVertical: 5,
  },
  spacer: {
    height: 8,
  },
  player: {
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 11,
    gap: 8,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    justifyContent: 'center',
  },
  trackFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  thumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
    backgroundColor: colors.primaryDark,
    transform: [{ translateX: -7 }],
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  time: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.muted,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 2,
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  playButtonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.96 }],
  },
  playIcon: {
    marginLeft: 3,
  },
  volume: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  volumeTrack: {
    width: 96,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  volumeFill: {
    width: '75%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.muted,
  },
}));
