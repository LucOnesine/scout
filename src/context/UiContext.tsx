import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AideSheet } from '../components/AideSheet';
import { HistoriqueSheet } from '../components/HistoriqueSheet';
import { ParametresSheet } from '../components/ParametresSheet';
import { useDatabase } from './DatabaseContext';
import type { HistoryEntry } from '../types';

type Sheet = 'aide' | 'params' | 'history' | null;

type UiContextValue = {
  openAide: () => void;
  openParams: () => void;
  openHistory: () => void;
  history: HistoryEntry[];
  addHistory: (type: string, action: string, icon: string) => void;
  deleteHistory: (id: number) => void;
  clearHistory: () => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [sheet, setSheet] = useState<Sheet>(null);
  const { history, addHistory, deleteHistory, clearHistory, refreshHistory } = useDatabase();

  const openAide = useCallback(() => setSheet('aide'), []);
  const openParams = useCallback(() => setSheet('params'), []);
  const openHistory = useCallback(() => {
    void refreshHistory();
    setSheet('history');
  }, [refreshHistory]);
  const closeSheet = useCallback(() => setSheet(null), []);

  const value = useMemo(
    () => ({
      openAide,
      openParams,
      openHistory,
      history,
      addHistory,
      deleteHistory,
      clearHistory,
    }),
    [openAide, openParams, openHistory, history, addHistory, deleteHistory, clearHistory],
  );

  return (
    <UiContext.Provider value={value}>
      {children}
      <AideSheet visible={sheet === 'aide'} onClose={closeSheet} />
      <ParametresSheet visible={sheet === 'params'} onClose={closeSheet} />
      <HistoriqueSheet
        visible={sheet === 'history'}
        historique={history}
        onDelete={deleteHistory}
        onClear={clearHistory}
        onClose={closeSheet}
      />
    </UiContext.Provider>
  );
}

export function useUi() {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used inside UiProvider');
  }
  return context;
}
