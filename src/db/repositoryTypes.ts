import type { ChantItem, CodeItem, HistoryEntry, KojaItem, TechniqueItem } from '../types';

export type ContentData = {
  codes: CodeItem[];
  kojas: KojaItem[];
  techniques: TechniqueItem[];
  chants: ChantItem[];
};

export type ContentKind = keyof ContentData;

export type ContentItemMap = {
  codes: CodeItem;
  kojas: KojaItem;
  techniques: TechniqueItem;
  chants: ChantItem;
};

export type ContentItem = ContentItemMap[ContentKind];

export type StoredHistoryEntry = {
  id: number;
  type: string;
  action: string;
  icon: string;
  createdAt: number;
};

export type Repository = {
  loadContent: () => Promise<ContentData>;
  saveContent: <K extends ContentKind>(kind: K, item: ContentItemMap[K]) => Promise<ContentData>;
  deleteContent: (kind: ContentKind, id: number) => Promise<ContentData>;
  listHistory: () => Promise<HistoryEntry[]>;
  addHistory: (type: string, action: string, icon: string) => Promise<HistoryEntry[]>;
  deleteHistory: (id: number) => Promise<HistoryEntry[]>;
  clearHistory: () => Promise<HistoryEntry[]>;
};

export const HISTORY_LIMIT = 10;
