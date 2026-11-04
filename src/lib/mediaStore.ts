import { Directory, File, Paths } from 'expo-file-system';
import { Platform, type ImageSourcePropType } from 'react-native';

const MEDIA_DIRECTORY_NAME = 'k2th-media';

function mediaDirectory() {
  return new Directory(Paths.document, MEDIA_DIRECTORY_NAME);
}

function ensureMediaDirectory() {
  const directory = mediaDirectory();
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
  return directory;
}

function sanitizeExtension(value: string) {
  const match = /\.([a-z0-9]+)$/i.exec(value);
  const extension = match ? match[1].toLowerCase() : '';
  return extension.length <= 4 && extension ? extension : 'bin';
}

function buildKey(prefix: string, sourceUri: string) {
  const extension = sanitizeExtension(sourceUri.split('?')[0]);
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
}

export function isMediaImportAvailable() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function saveMediaFromUri(sourceUri: string, prefix: string): string {
  const directory = ensureMediaDirectory();
  const key = buildKey(prefix, sourceUri);
  const destination = new File(directory, key);
  new File(sourceUri).copy(destination);
  return key;
}

export function mediaFileExists(key: string) {
  if (!key || !isMediaImportAvailable()) {
    return false;
  }
  try {
    return new File(mediaDirectory(), key).exists;
  } catch {
    return false;
  }
}

export function mediaFileUri(key: string) {
  return new File(mediaDirectory(), key).uri;
}

export function deleteMediaFile(key: string) {
  if (!key || !isMediaImportAvailable()) {
    return;
  }
  try {
    const file = new File(mediaDirectory(), key);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // The file may already be gone; leftover copies are harmless.
  }
}

export function deleteMediaFiles(keys: string[]) {
  for (const key of keys) {
    deleteMediaFile(key);
  }
}

export function mediaImageSource(key: string): ImageSourcePropType | null {
  return mediaFileExists(key) ? { uri: mediaFileUri(key) } : null;
}
