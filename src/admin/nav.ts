import { createContext, useContext } from 'react';
import type { ContentKind } from '../db/repositoryTypes';

export type AdminRoute =
  | { name: 'list' }
  | { name: 'editor'; kind: ContentKind; itemId: number | null };

export type AdminNav = {
  push: (route: AdminRoute) => void;
  back: () => void;
};

export const AdminNavContext = createContext<AdminNav | null>(null);

export function useAdminNav(): AdminNav {
  const context = useContext(AdminNavContext);
  if (!context) {
    throw new Error('useAdminNav must be used inside AdminApp');
  }
  return context;
}
