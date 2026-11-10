import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { ContentData } from '../db/repositoryTypes';
import { mediaFileBase64 } from './mediaStore';

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  gif: 'image/gif',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  caf: 'audio/x-caf',
  aiff: 'audio/aiff',
};

function mimeForKey(key: string) {
  const extension = key.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXT[extension] ?? 'application/octet-stream';
}

// koja.imageKey est un sélecteur d'image intégrée, pas un fichier importé : il voyage comme texte.
function collectMediaKeys(content: ContentData): Set<string> {
  const keys = new Set<string>();
  const add = (key: string) => {
    if (key) {
      keys.add(key);
    }
  };
  for (const chant of content.chants) {
    add(chant.audioKey);
  }
  for (const koja of content.kojas) {
    add(koja.coverKey);
    for (const photo of koja.photos) {
      add(photo);
    }
  }
  for (const technique of content.techniques) {
    add(technique.iconKey);
    for (const step of technique.steps) {
      add(step.imageKey);
    }
  }
  return keys;
}

export type ContentExport = {
  format: 'k2th-content';
  formatVersion: 1;
  exportedAt: string;
  content: ContentData;
  media: Record<string, { mime: string; base64: string }>;
};

export async function exportContent(content: ContentData): Promise<void> {
  const media: ContentExport['media'] = {};
  for (const key of collectMediaKeys(content)) {
    const base64 = await mediaFileBase64(key);
    if (base64) {
      media[key] = { mime: mimeForKey(key), base64 };
    }
  }

  const payload: ContentExport = {
    format: 'k2th-content',
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    content,
    media,
  };

  const file = new File(Paths.cache, `k2th-content-${Date.now()}.json`);
  await file.write(JSON.stringify(payload));

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Le partage n’est pas disponible sur cet appareil.');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    UTI: 'public.json',
    dialogTitle: 'Exporter le contenu K2TH',
  });
}