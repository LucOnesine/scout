import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { repository } from '../db/repository';
import type { ContentData, ContentItemMap, ContentKind } from '../db/repositoryTypes';
import { fonts, type ThemeColors, themed } from '../theme/theme';
import type { HistoryEntry } from '../types';
import { useTheme } from './SettingsContext';

type DatabaseContextValue = ContentData & {
  history: HistoryEntry[];
  saveContent: <K extends ContentKind>(kind: K, item: ContentItemMap[K]) => Promise<void>;
  deleteContent: (kind: ContentKind, id: number) => Promise<void>;
  addHistory: (type: string, action: string, icon: string) => void;
  deleteHistory: (id: number) => void;
  clearHistory: () => void;
  refreshHistory: () => Promise<void>;
};

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  const [content, setContent] = useState<ContentData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setError(null);
    setContent(null);

    Promise.all([repository.loadContent(), repository.listHistory()])
      .then(([loadedContent, loadedHistory]) => {
        if (!active) {
          return;
        }
        setContent(loadedContent);
        setHistory(loadedHistory);
      })
      .catch((cause) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : '');
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const applyHistoryAction = useCallback(async (action: () => Promise<HistoryEntry[]>) => {
    try {
      setHistory(await action());
    } catch (cause) {
      console.warn('Écriture SQLite impossible', cause);
    }
  }, []);

  const saveContent = useCallback(
    async <K extends ContentKind,>(kind: K, item: ContentItemMap[K]) => {
      setContent(await repository.saveContent(kind, item));
    },
    [],
  );

  const deleteContent = useCallback(async (kind: ContentKind, id: number) => {
    setContent(await repository.deleteContent(kind, id));
  }, []);

  const addHistory = useCallback(
    (type: string, action: string, icon: string) => {
      void applyHistoryAction(() => repository.addHistory(type, action, icon));
    },
    [applyHistoryAction],
  );

  const deleteHistory = useCallback(
    (id: number) => {
      void applyHistoryAction(() => repository.deleteHistory(id));
    },
    [applyHistoryAction],
  );

  const clearHistory = useCallback(() => {
    void applyHistoryAction(() => repository.clearHistory());
  }, [applyHistoryAction]);

  const refreshHistory = useCallback(async () => {
    try {
      setHistory(await repository.listHistory());
    } catch (cause) {
      console.warn('Lecture SQLite impossible', cause);
    }
  }, []);

  const value = useMemo<DatabaseContextValue | null>(() => {
    if (!content) {
      return null;
    }
    return {
      ...content,
      history,
      saveContent,
      deleteContent,
      addHistory,
      deleteHistory,
      clearHistory,
      refreshHistory,
    };
  }, [
    content,
    history,
    saveContent,
    deleteContent,
    addHistory,
    deleteHistory,
    clearHistory,
    refreshHistory,
  ]);

  if (error) {
    return (
      <View style={styles.state}>
        <Text style={styles.errorTitle}>{t.dbUnavailable}</Text>
        <Text style={styles.errorText}>{error.length > 0 ? error : t.unknownError}</Text>
        <Pressable
          onPress={() => setAttempt((current) => current + 1)}
          style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
        >
          <Text style={styles.retryText}>{t.retry}</Text>
        </Pressable>
      </View>
    );
  }

  if (!value) {
    return (
      <View style={styles.state}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t.dbLoading}</Text>
      </View>
    );
  }

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used inside DatabaseProvider');
  }
  return context;
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
    gap: 10,
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  errorTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.deep,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.muted,
  },
  retry: {
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  retryPressed: {
    backgroundColor: colors.primaryDark,
  },
  retryText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.white,
  },
}));
