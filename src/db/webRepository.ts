import { CHANTS } from '../data/chants';
import { CODES } from '../data/codes';
import { buildSeedHistory } from '../data/history';
import { KOJAS } from '../data/kojas';
import { TECHNIQUES } from '../data/techniques';
import type { ChantItem, CodeItem, HistoryEntry, KojaItem, TechniqueItem } from '../types';
import { formatHistoryTime } from './historyTime';
import {
  HISTORY_LIMIT,
  type ContentData,
  type ContentItemMap,
  type ContentKind,
  type Repository,
  type StoredHistoryEntry,
} from './repositoryTypes';

const HISTORY_STORAGE_KEY = 'k2th.history.v1';
const CONTENT_STORAGE_KEY = 'k2th.content.v1';

let memoryHistory: StoredHistoryEntry[] | null = null;
let memoryContent: ContentData | null = null;

function saveStored(entries: StoredHistoryEntry[]) {
  memoryHistory = entries;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
    }
  } catch {
    // Storage may be unavailable (private mode); the in-memory copy still works.
  }
}

function loadStored(): StoredHistoryEntry[] {
  if (memoryHistory) {
    return memoryHistory;
  }
  try {
    const raw =
      typeof localStorage === 'undefined' ? null : localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredHistoryEntry[];
      if (Array.isArray(parsed)) {
        memoryHistory = parsed;
        return parsed;
      }
    }
  } catch {
    // Fall back to a fresh seed below.
  }
  const initial = seedHistory();
  saveStored(initial);
  return initial;
}

function seedHistory(): StoredHistoryEntry[] {
  return buildSeedHistory().map(({ id, type, action, icon, createdAt }) => ({
    id,
    type,
    action,
    icon,
    createdAt,
  }));
}

function saveContentStore(content: ContentData) {
  memoryContent = content;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
    }
  } catch {
    // Keep the in-memory copy when storage is unavailable.
  }
}

function seedContent(): ContentData {
  return JSON.parse(
    JSON.stringify({ codes: CODES, kojas: KOJAS, techniques: TECHNIQUES, chants: CHANTS }),
  ) as ContentData;
}

function hasMediaFields(content: ContentData) {
  return content.chants.every((chant) => 'audioKey' in chant);
}

function loadContentStore(): ContentData {
  if (memoryContent) {
    return memoryContent;
  }
  try {
    const raw =
      typeof localStorage === 'undefined' ? null : localStorage.getItem(CONTENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ContentData;
      if (
        Array.isArray(parsed.codes) &&
        Array.isArray(parsed.kojas) &&
        Array.isArray(parsed.techniques) &&
        Array.isArray(parsed.chants) &&
        hasMediaFields(parsed)
      ) {
        memoryContent = parsed;
        return parsed;
      }
    }
  } catch {
    // Fall back to the bundled seed below.
  }
  const initial = seedContent();
  saveContentStore(initial);
  return initial;
}

function upsert<T extends { id: number }>(list: T[], item: T): T[] {
  if (item.id <= 0) {
    const id = list.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
    return [...list, { ...item, id }];
  }
  return list.map((entry) => (entry.id === item.id ? item : entry));
}

function toEntries(entries: StoredHistoryEntry[]): HistoryEntry[] {
  return [...entries]
    .sort((left, right) => right.createdAt - left.createdAt || right.id - left.id)
    .slice(0, HISTORY_LIMIT)
    .map((entry) => ({
      id: entry.id,
      type: entry.type,
      action: entry.action,
      icon: entry.icon,
      time: formatHistoryTime(entry.createdAt),
    }));
}

export const webRepository: Repository = {
  async loadContent(): Promise<ContentData> {
    return loadContentStore();
  },

  async saveContent<K extends ContentKind>(kind: K, item: ContentItemMap[K]) {
    const content = loadContentStore();
    const next = { ...content };
    switch (kind) {
      case 'codes':
        next.codes = upsert(content.codes, item as CodeItem);
        break;
      case 'kojas':
        next.kojas = upsert(content.kojas, item as KojaItem);
        break;
      case 'techniques':
        next.techniques = upsert(content.techniques, item as TechniqueItem);
        break;
      case 'chants':
        next.chants = upsert(content.chants, item as ChantItem);
        break;
    }
    saveContentStore(next);
    return next;
  },

  async deleteContent(kind, id) {
    const content = loadContentStore();
    const next = { ...content };
    switch (kind) {
      case 'codes':
        next.codes = content.codes.filter((entry) => entry.id !== id);
        break;
      case 'kojas':
        next.kojas = content.kojas.filter((entry) => entry.id !== id);
        break;
      case 'techniques':
        next.techniques = content.techniques.filter((entry) => entry.id !== id);
        break;
      case 'chants':
        next.chants = content.chants.filter((entry) => entry.id !== id);
        break;
    }
    saveContentStore(next);
    return next;
  },

  async listHistory() {
    return toEntries(loadStored());
  },

  async addHistory(type, action, icon) {
    const stored = loadStored();
    const nextId = stored.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
    const next = [...stored, { id: nextId, type, action, icon, createdAt: Date.now() }]
      .sort((left, right) => left.createdAt - right.createdAt || left.id - right.id)
      .slice(-HISTORY_LIMIT);
    saveStored(next);
    return toEntries(next);
  },

  async deleteHistory(id) {
    const next = loadStored().filter((entry) => entry.id !== id);
    saveStored(next);
    return toEntries(next);
  },

  async clearHistory() {
    saveStored([]);
    return [];
  },
};
