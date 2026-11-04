export type HistorySeed = {
  type: string;
  action: string;
  icon: string;
  minutesAgo?: number;
  daysAgo?: number;
  hour?: number;
  minute?: number;
};

export const HISTORY_SEED: HistorySeed[] = [
  { type: 'Code', action: 'Consulté Code Morse', icon: '📡', minutesAgo: 5 },
  { type: 'Hira', action: 'Écouté Hymne K2TH', icon: '🎵', minutesAgo: 20 },
  { type: 'Teknika', action: 'Lu Premiers Secours', icon: '🩹', daysAgo: 1, hour: 18, minute: 30 },
  { type: 'Koja', action: 'Lu Camp National 2023', icon: '📖', daysAgo: 1, hour: 15, minute: 0 },
  { type: 'Code', action: 'Testé Sémaphore', icon: '🚩', daysAgo: 2, hour: 12, minute: 0 },
];

export function buildSeedHistory(now = Date.now()) {
  return HISTORY_SEED.map((entry, index) => {
    let createdAt: number;
    if (entry.minutesAgo !== undefined) {
      createdAt = now - entry.minutesAgo * 60_000;
    } else {
      const date = new Date(now);
      date.setDate(date.getDate() - (entry.daysAgo ?? 0));
      date.setHours(entry.hour ?? 12, entry.minute ?? 0, 0, 0);
      createdAt = date.getTime();
    }
    return {
      id: index + 1,
      type: entry.type,
      action: entry.action,
      icon: entry.icon,
      createdAt,
    };
  });
}

export const TAB_META = {
  code: { label: 'Code', icon: '📡', historyType: 'Code' },
  koja: { label: 'Koja', icon: '📖', historyType: 'Koja' },
  teknika: { label: 'Teknika', icon: '🛠️', historyType: 'Teknika' },
  hira: { label: 'Hira', icon: '🎵', historyType: 'Hira' },
} as const;
