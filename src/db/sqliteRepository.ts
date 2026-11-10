import * as SQLite from 'expo-sqlite';
import seed from '../data/content.json';
import { buildSeedHistory } from '../data/history';
import { deleteMediaFiles } from '../lib/mediaStore';
import type {
  ChantItem,
  CodeItem,
  CodeType,
  HistoryEntry,
  KojaItem,
  TechniqueItem,
  TechniqueStep,
} from '../types';
import { formatHistoryTime } from './historyTime';
import {
  HISTORY_LIMIT,
  type ContentData,
  type ContentItemMap,
  type ContentKind,
  type Repository,
} from './repositoryTypes';
import { SCHEMA_SQL } from './schema';

const DATABASE_NAME = 'k2th-scout.db';
const MEDIA_MIGRATION_KEY = 'media_columns_migrated';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = initialize().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

async function readMeta(db: SQLite.SQLiteDatabase, key: string) {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', [
    key,
  ]);
  return row?.value ?? null;
}

async function writeMeta(db: SQLite.SQLiteDatabase, key: string, value: string) {
  await db.runAsync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', [key, value]);
}

async function hasColumn(db: SQLite.SQLiteDatabase, table: string, column: string) {
  const rows = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  return rows.some((row) => row.name === column);
}

async function migrateMediaColumns(db: SQLite.SQLiteDatabase) {
  if ((await readMeta(db, MEDIA_MIGRATION_KEY)) === '1') {
    return;
  }
  const additions: [string, string, string][] = [
    ['kojas', 'cover_key', "ALTER TABLE kojas ADD COLUMN cover_key TEXT NOT NULL DEFAULT ''"],
    ['techniques', 'icon_key', "ALTER TABLE techniques ADD COLUMN icon_key TEXT NOT NULL DEFAULT ''"],
    [
      'technique_steps',
      'image_key',
      "ALTER TABLE technique_steps ADD COLUMN image_key TEXT NOT NULL DEFAULT ''",
    ],
    ['chants', 'audio_key', "ALTER TABLE chants ADD COLUMN audio_key TEXT NOT NULL DEFAULT ''"],
  ];
  for (const [table, column, sql] of additions) {
    if (!(await hasColumn(db, table, column))) {
      await db.runAsync(sql);
    }
  }
  await writeMeta(db, MEDIA_MIGRATION_KEY, '1');
}

async function initialize() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await db.execAsync(SCHEMA_SQL);
  await migrateMediaColumns(db);
  await seedContent(db);
  await seedHistory(db);
  return db;
}

async function seedContent(db: SQLite.SQLiteDatabase) {
  if ((await readMeta(db, 'content_version')) === String(seed.version)) {
    return;
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM codes');
    await db.runAsync('DELETE FROM kojas');
    await db.runAsync('DELETE FROM techniques');
    await db.runAsync('DELETE FROM chants');

    for (const code of seed.codes) {
      await db.runAsync(
        'INSERT INTO codes (id, name, icon, description, type) VALUES (?, ?, ?, ?, ?)',
        [code.id, code.name, code.icon, code.desc, code.type],
      );
      for (const [position, cell] of code.table.entries()) {
        await db.runAsync(
          'INSERT INTO code_symbols (code_id, letter, symbol, position) VALUES (?, ?, ?, ?)',
          [code.id, cell.l, cell.c, position],
        );
      }
    }

    for (const koja of seed.kojas) {
      await db.runAsync(
        'INSERT INTO kojas (id, title, date, image_key, cover_key, description) VALUES (?, ?, ?, ?, ?, ?)',
        [koja.id, koja.title, koja.date, koja.imageKey, koja.coverKey, koja.desc],
      );
      for (const [position, tag] of koja.tags.entries()) {
        await db.runAsync('INSERT INTO koja_tags (koja_id, tag, position) VALUES (?, ?, ?)', [
          koja.id,
          tag,
          position,
        ]);
      }
      for (const [position, photo] of koja.photos.entries()) {
        await db.runAsync(
          'INSERT INTO koja_photos (koja_id, image_key, position) VALUES (?, ?, ?)',
          [koja.id, photo, position],
        );
      }
    }

    for (const technique of seed.techniques) {
      await db.runAsync(
        `INSERT INTO techniques (id, name, icon, icon_key, category, level, level_color, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          technique.id,
          technique.name,
          technique.icon,
          technique.iconKey,
          technique.cat,
          technique.level,
          technique.levelColor,
          technique.desc,
        ],
      );
      for (const [position, step] of technique.steps.entries()) {
        await db.runAsync(
          'INSERT INTO technique_steps (technique_id, position, content, image_key) VALUES (?, ?, ?, ?)',
          [technique.id, position, step.text, step.imageKey],
        );
      }
    }

    for (const chant of seed.chants) {
      await db.runAsync(
        `INSERT INTO chants (id, title, artist, duration, genre, gradient_from, gradient_to, audio_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          chant.id,
          chant.title,
          chant.artist,
          chant.dur,
          chant.genre,
          chant.gradient[0],
          chant.gradient[1],
          chant.audioKey,
        ],
      );
      for (const [position, line] of chant.lyrics.split('\n').entries()) {
        await db.runAsync('INSERT INTO chant_lines (chant_id, position, content) VALUES (?, ?, ?)', [
          chant.id,
          position,
          line,
        ]);
      }
    }

    await writeMeta(db, 'content_version', String(seed.version));
  });
}

async function seedHistory(db: SQLite.SQLiteDatabase) {
  if (await readMeta(db, 'history_seeded')) {
    return;
  }

  await db.withTransactionAsync(async () => {
    for (const entry of buildSeedHistory()) {
      await db.runAsync(
        'INSERT INTO history (type, action, icon, created_at) VALUES (?, ?, ?, ?)',
        [entry.type, entry.action, entry.icon, entry.createdAt],
      );
    }
    await writeMeta(db, 'history_seeded', '1');
  });
}

type CodeRow = {
  id: number;
  name: string;
  icon: string;
  description: string;
  type: string;
};

type SymbolRow = {
  code_id: number;
  letter: string;
  symbol: string;
};

async function queryCodes(db: SQLite.SQLiteDatabase): Promise<CodeItem[]> {
  const codes = await db.getAllAsync<CodeRow>(
    'SELECT id, name, icon, description, type FROM codes ORDER BY id',
  );
  const symbols = await db.getAllAsync<SymbolRow>(
    'SELECT code_id, letter, symbol FROM code_symbols ORDER BY code_id, position',
  );
  const byCode = new Map<number, CodeItem['table']>();
  for (const symbol of symbols) {
    const table = byCode.get(symbol.code_id) ?? [];
    table.push({ l: symbol.letter, c: symbol.symbol });
    byCode.set(symbol.code_id, table);
  }
  return codes.map((code) => ({
    id: code.id,
    name: code.name,
    icon: code.icon,
    desc: code.description,
    type: code.type as CodeType,
    table: byCode.get(code.id) ?? [],
  }));
}

type KojaRow = {
  id: number;
  title: string;
  date: string;
  image_key: string;
  cover_key: string;
  description: string;
};

type TagRow = {
  koja_id: number;
  tag: string;
};

type PhotoRow = {
  koja_id: number;
  image_key: string;
};

async function queryKojas(db: SQLite.SQLiteDatabase): Promise<KojaItem[]> {
  const kojas = await db.getAllAsync<KojaRow>(
    'SELECT id, title, date, image_key, cover_key, description FROM kojas ORDER BY id',
  );
  const tags = await db.getAllAsync<TagRow>(
    'SELECT koja_id, tag FROM koja_tags ORDER BY koja_id, position',
  );
  const photos = await db.getAllAsync<PhotoRow>(
    'SELECT koja_id, image_key FROM koja_photos ORDER BY koja_id, position',
  );
  const byKoja = new Map<number, string[]>();
  for (const tag of tags) {
    const list = byKoja.get(tag.koja_id) ?? [];
    list.push(tag.tag);
    byKoja.set(tag.koja_id, list);
  }
  const byPhoto = new Map<number, string[]>();
  for (const photo of photos) {
    const list = byPhoto.get(photo.koja_id) ?? [];
    list.push(photo.image_key);
    byPhoto.set(photo.koja_id, list);
  }
  return kojas.map((koja) => ({
    id: koja.id,
    title: koja.title,
    date: koja.date,
    imageKey: koja.image_key,
    coverKey: koja.cover_key,
    desc: koja.description,
    tags: byKoja.get(koja.id) ?? [],
    photos: byPhoto.get(koja.id) ?? [],
  }));
}

type TechniqueRow = {
  id: number;
  name: string;
  icon: string;
  icon_key: string;
  category: string;
  level: string;
  level_color: string;
  description: string;
};

type StepRow = {
  technique_id: number;
  content: string;
  image_key: string;
};

async function queryTechniques(db: SQLite.SQLiteDatabase): Promise<TechniqueItem[]> {
  const techniques = await db.getAllAsync<TechniqueRow>(
    `SELECT id, name, icon, icon_key, category, level, level_color, description
     FROM techniques ORDER BY id`,
  );
  const steps = await db.getAllAsync<StepRow>(
    'SELECT technique_id, content, image_key FROM technique_steps ORDER BY technique_id, position',
  );
  const byTechnique = new Map<number, TechniqueStep[]>();
  for (const step of steps) {
    const list = byTechnique.get(step.technique_id) ?? [];
    list.push({ text: step.content, imageKey: step.image_key });
    byTechnique.set(step.technique_id, list);
  }
  return techniques.map((technique) => ({
    id: technique.id,
    name: technique.name,
    icon: technique.icon,
    iconKey: technique.icon_key,
    cat: technique.category,
    level: technique.level,
    levelColor: technique.level_color,
    desc: technique.description,
    steps: byTechnique.get(technique.id) ?? [],
  }));
}

type ChantRow = {
  id: number;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  gradient_from: string;
  gradient_to: string;
  audio_key: string;
};

type LineRow = {
  chant_id: number;
  content: string;
};

async function queryChants(db: SQLite.SQLiteDatabase): Promise<ChantItem[]> {
  const chants = await db.getAllAsync<ChantRow>(
    `SELECT id, title, artist, duration, genre, gradient_from, gradient_to, audio_key
     FROM chants ORDER BY id`,
  );
  const lines = await db.getAllAsync<LineRow>(
    'SELECT chant_id, content FROM chant_lines ORDER BY chant_id, position',
  );
  const byChant = new Map<number, string[]>();
  for (const line of lines) {
    const list = byChant.get(line.chant_id) ?? [];
    list.push(line.content);
    byChant.set(line.chant_id, list);
  }
  return chants.map((chant) => ({
    id: chant.id,
    title: chant.title,
    artist: chant.artist,
    dur: chant.duration,
    genre: chant.genre,
    lyrics: (byChant.get(chant.id) ?? []).join('\n'),
    gradient: [chant.gradient_from, chant.gradient_to],
    audioKey: chant.audio_key,
  }));
}

type HistoryRow = {
  id: number;
  type: string;
  action: string;
  icon: string;
  created_at: number;
};

async function queryHistory(db: SQLite.SQLiteDatabase): Promise<HistoryEntry[]> {
  const rows = await db.getAllAsync<HistoryRow>(
    `SELECT id, type, action, icon, created_at
     FROM history ORDER BY created_at DESC, id DESC LIMIT ?`,
    [HISTORY_LIMIT],
  );
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    action: row.action,
    icon: row.icon,
    time: formatHistoryTime(row.created_at),
  }));
}

async function queryContent(db: SQLite.SQLiteDatabase): Promise<ContentData> {
  const [codes, kojas, techniques, chants] = await Promise.all([
    queryCodes(db),
    queryKojas(db),
    queryTechniques(db),
    queryChants(db),
  ]);
  return { codes, kojas, techniques, chants };
}

const NEXT_ID_SQL: Record<ContentKind, string> = {
  codes: 'SELECT COALESCE(MAX(id), 0) + 1 AS next FROM codes',
  kojas: 'SELECT COALESCE(MAX(id), 0) + 1 AS next FROM kojas',
  techniques: 'SELECT COALESCE(MAX(id), 0) + 1 AS next FROM techniques',
  chants: 'SELECT COALESCE(MAX(id), 0) + 1 AS next FROM chants',
};

const DELETE_SQL: Record<ContentKind, string> = {
  codes: 'DELETE FROM codes WHERE id = ?',
  kojas: 'DELETE FROM kojas WHERE id = ?',
  techniques: 'DELETE FROM techniques WHERE id = ?',
  chants: 'DELETE FROM chants WHERE id = ?',
};

async function nextId(db: SQLite.SQLiteDatabase, kind: ContentKind) {
  const row = await db.getFirstAsync<{ next: number }>(NEXT_ID_SQL[kind]);
  return row?.next ?? 1;
}

async function saveCode(db: SQLite.SQLiteDatabase, code: CodeItem) {
  const isNew = code.id <= 0;
  const id = isNew ? await nextId(db, 'codes') : code.id;

  await db.withTransactionAsync(async () => {
    if (isNew) {
      await db.runAsync(
        'INSERT INTO codes (id, name, icon, description, type) VALUES (?, ?, ?, ?, ?)',
        [id, code.name, code.icon, code.desc, code.type],
      );
    } else {
      await db.runAsync(
        'UPDATE codes SET name = ?, icon = ?, description = ?, type = ? WHERE id = ?',
        [code.name, code.icon, code.desc, code.type, id],
      );
    }
    await db.runAsync('DELETE FROM code_symbols WHERE code_id = ?', [id]);
    for (const [position, cell] of code.table.entries()) {
      await db.runAsync(
        'INSERT INTO code_symbols (code_id, letter, symbol, position) VALUES (?, ?, ?, ?)',
        [id, cell.l, cell.c, position],
      );
    }
  });
}

async function saveKoja(db: SQLite.SQLiteDatabase, koja: KojaItem) {
  const isNew = koja.id <= 0;
  const id = isNew ? await nextId(db, 'kojas') : koja.id;

  await db.withTransactionAsync(async () => {
    if (isNew) {
      await db.runAsync(
        'INSERT INTO kojas (id, title, date, image_key, cover_key, description) VALUES (?, ?, ?, ?, ?, ?)',
        [id, koja.title, koja.date, koja.imageKey, koja.coverKey, koja.desc],
      );
    } else {
      await db.runAsync(
        'UPDATE kojas SET title = ?, date = ?, image_key = ?, cover_key = ?, description = ? WHERE id = ?',
        [koja.title, koja.date, koja.imageKey, koja.coverKey, koja.desc, id],
      );
    }
    await db.runAsync('DELETE FROM koja_tags WHERE koja_id = ?', [id]);
    for (const [position, tag] of koja.tags.entries()) {
      await db.runAsync('INSERT INTO koja_tags (koja_id, tag, position) VALUES (?, ?, ?)', [
        id,
        tag,
        position,
      ]);
    }
    await db.runAsync('DELETE FROM koja_photos WHERE koja_id = ?', [id]);
    for (const [position, photo] of koja.photos.entries()) {
      await db.runAsync(
        'INSERT INTO koja_photos (koja_id, image_key, position) VALUES (?, ?, ?)',
        [id, photo, position],
      );
    }
  });
}

async function saveTechnique(db: SQLite.SQLiteDatabase, technique: TechniqueItem) {
  const isNew = technique.id <= 0;
  const id = isNew ? await nextId(db, 'techniques') : technique.id;

  await db.withTransactionAsync(async () => {
    if (isNew) {
      await db.runAsync(
        `INSERT INTO techniques (id, name, icon, icon_key, category, level, level_color, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          technique.name,
          technique.icon,
          technique.iconKey,
          technique.cat,
          technique.level,
          technique.levelColor,
          technique.desc,
        ],
      );
    } else {
      await db.runAsync(
        `UPDATE techniques
         SET name = ?, icon = ?, icon_key = ?, category = ?, level = ?, level_color = ?, description = ?
         WHERE id = ?`,
        [
          technique.name,
          technique.icon,
          technique.iconKey,
          technique.cat,
          technique.level,
          technique.levelColor,
          technique.desc,
          id,
        ],
      );
    }
    await db.runAsync('DELETE FROM technique_steps WHERE technique_id = ?', [id]);
    for (const [position, step] of technique.steps.entries()) {
      await db.runAsync(
        'INSERT INTO technique_steps (technique_id, position, content, image_key) VALUES (?, ?, ?, ?)',
        [id, position, step.text, step.imageKey],
      );
    }
  });
}

async function saveChant(db: SQLite.SQLiteDatabase, chant: ChantItem) {
  const isNew = chant.id <= 0;
  const id = isNew ? await nextId(db, 'chants') : chant.id;

  await db.withTransactionAsync(async () => {
    if (isNew) {
      await db.runAsync(
        `INSERT INTO chants (id, title, artist, duration, genre, gradient_from, gradient_to, audio_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          chant.title,
          chant.artist,
          chant.dur,
          chant.genre,
          chant.gradient[0],
          chant.gradient[1],
          chant.audioKey,
        ],
      );
    } else {
      await db.runAsync(
        `UPDATE chants
         SET title = ?, artist = ?, duration = ?, genre = ?, gradient_from = ?, gradient_to = ?, audio_key = ?
         WHERE id = ?`,
        [
          chant.title,
          chant.artist,
          chant.dur,
          chant.genre,
          chant.gradient[0],
          chant.gradient[1],
          chant.audioKey,
          id,
        ],
      );
    }
    await db.runAsync('DELETE FROM chant_lines WHERE chant_id = ?', [id]);
    for (const [position, line] of chant.lyrics.split('\n').entries()) {
      await db.runAsync('INSERT INTO chant_lines (chant_id, position, content) VALUES (?, ?, ?)', [
        id,
        position,
        line,
      ]);
    }
  });
}

export const sqliteRepository: Repository = {
  async loadContent(): Promise<ContentData> {
    return queryContent(await getDatabase());
  },

  async saveContent<K extends ContentKind>(kind: K, item: ContentItemMap[K]) {
    const db = await getDatabase();
    switch (kind) {
      case 'codes':
        await saveCode(db, item as CodeItem);
        break;
      case 'kojas':
        await saveKoja(db, item as KojaItem);
        break;
      case 'techniques':
        await saveTechnique(db, item as TechniqueItem);
        break;
      case 'chants':
        await saveChant(db, item as ChantItem);
        break;
    }
    return queryContent(db);
  },

  async deleteContent(kind, id) {
    const db = await getDatabase();
    const content = await queryContent(db);
    await db.runAsync(DELETE_SQL[kind], [id]);
    if (kind === 'chants') {
      const item = content.chants.find((entry) => entry.id === id);
      if (item) {
        deleteMediaFiles([item.audioKey]);
      }
    } else if (kind === 'kojas') {
      const item = content.kojas.find((entry) => entry.id === id);
      if (item) {
        deleteMediaFiles([item.coverKey, ...item.photos]);
      }
    } else if (kind === 'techniques') {
      const item = content.techniques.find((entry) => entry.id === id);
      if (item) {
        deleteMediaFiles([item.iconKey, ...item.steps.map((step) => step.imageKey)]);
      }
    }
    return queryContent(db);
  },

  async listHistory(): Promise<HistoryEntry[]> {
    return queryHistory(await getDatabase());
  },

  async addHistory(type, action, icon) {
    const db = await getDatabase();
    await db.runAsync('INSERT INTO history (type, action, icon, created_at) VALUES (?, ?, ?, ?)', [
      type,
      action,
      icon,
      Date.now(),
    ]);
    await db.runAsync(
      `DELETE FROM history WHERE id NOT IN (
         SELECT id FROM history ORDER BY created_at DESC, id DESC LIMIT ?
       )`,
      [HISTORY_LIMIT],
    );
    return queryHistory(db);
  },

  async deleteHistory(id) {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM history WHERE id = ?', [id]);
    return queryHistory(db);
  },

  async clearHistory() {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM history');
    return [];
  },
};