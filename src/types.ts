export type TabId = 'code' | 'koja' | 'teknika' | 'hira';

export type ThemeMode = 'system' | 'light' | 'dark';

export type Language = 'fr' | 'mg' | 'en';

export type AppSettings = {
  themeMode: ThemeMode;
  language: Language;
  notifications: boolean;
  reminderHour: number;
  reminderMinute: number;
};

export type CodeType = 'morse' | 'alpha' | 'semaphore' | 'pigpen';

export type CodeItem = {
  id: number;
  name: string;
  icon: string;
  desc: string;
  type: CodeType;
  table: { l: string; c: string }[];
};

export type KojaItem = {
  id: number;
  title: string;
  date: string;
  imageKey: string;
  coverKey: string;
  desc: string;
  tags: string[];
  photos: string[];
};

export type TechniqueStep = {
  text: string;
  imageKey: string;
};

export type TechniqueItem = {
  id: number;
  name: string;
  icon: string;
  iconKey: string;
  cat: string;
  level: string;
  levelColor: string;
  desc: string;
  steps: TechniqueStep[];
};

export type ChantItem = {
  id: number;
  title: string;
  artist: string;
  dur: string;
  genre: string;
  lyrics: string;
  gradient: [string, string];
  audioKey: string;
};

export type HistoryEntry = {
  id: number;
  type: string;
  action: string;
  time: string;
  icon: string;
};
