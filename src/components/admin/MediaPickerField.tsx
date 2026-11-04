import { Image } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image as RNImage, Pressable, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { isMediaImportAvailable, mediaFileUri, saveMediaFromUri } from '../../lib/mediaStore';
import { fonts, type ThemeColors, themed } from '../../theme/theme';
import { useTheme } from '../../context/SettingsContext';

type Props = {
  label: string;
  value: string;
  onChange: (key: string) => void;
  kind: 'image' | 'audio';
  prefix: string;
  fileName?: string;
};

function baseName(uriOrName: string) {
  const clean = uriOrName.split('?')[0];
  const last = clean.split('/').pop() ?? clean;
  return last.length > 28 ? `${last.slice(0, 25)}…` : last;
}

export function MediaPickerField({ label, value, onChange, kind, prefix, fileName }: Props) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    if (!isMediaImportAvailable()) {
      Alert.alert('Non disponible', 'L’import de fichiers est disponible sur iOS et Android.');
      return;
    }
    try {
      setBusy(true);
      let sourceUri: string | null = null;
      if (kind === 'image') {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.85,
          allowsMultipleSelection: false,
        });
        if (!result.canceled && result.assets.length) {
          sourceUri = result.assets[0].uri;
        }
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'audio/*',
          copyToCacheDirectory: true,
        });
        if (!result.canceled && result.assets.length) {
          sourceUri = result.assets[0].uri;
        }
      }
      if (!sourceUri) {
        return;
      }
      const key = saveMediaFromUri(sourceUri, prefix);
      onChange(key);
    } catch {
      Alert.alert('Erreur', 'L’import du fichier a échoué.');
    } finally {
      setBusy(false);
    }
  };

  const display = fileName ?? (value ? baseName(value) : '');

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {value ? (
        <View style={styles.current}>
          {kind === 'image' ? (
            <RNImage source={{ uri: mediaFileUri(value) }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={styles.thumbFallback}>
              <Text style={styles.thumbFallbackText}>♪</Text>
            </View>
          )}
          <Text style={styles.fileName} numberOfLines={1}>
            {display}
          </Text>
          <Pressable
            onPress={() => onChange('')}
            accessibilityRole="button"
            accessibilityLabel={`Retirer ${label}`}
            hitSlop={6}
            style={styles.remove}
          >
            <Text style={styles.removeText}>✕</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={pick}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Image size={14} color={colors.primary} />
          )}
          <Text style={styles.buttonText}>
            {kind === 'image' ? 'Importer une image' : 'Importer un fichier audio'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.textSoft,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.mutedSoft,
    backgroundColor: colors.soft,
  },
  buttonPressed: {
    backgroundColor: colors.border,
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.primary,
  },
  current: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.soft,
  },
  thumbFallback: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.soft,
  },
  thumbFallbackText: {
    fontSize: 18,
    color: colors.primary,
  },
  fileName: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.deep,
  },
  remove: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerSoft,
  },
  removeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.danger,
  },
}));
