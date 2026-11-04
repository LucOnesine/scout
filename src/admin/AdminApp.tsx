import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DatabaseProvider } from '../context/DatabaseContext';
import { SettingsProvider, useTheme } from '../context/SettingsContext';
import type { ContentKind } from '../db/repositoryTypes';
import { AdminNavContext, type AdminNav, type AdminRoute } from './nav';
import { AdminEditorScreen } from './screens/AdminEditorScreen';
import { AdminListScreen } from './screens/AdminListScreen';

export default function AdminApp() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AdminContent />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

function AdminContent() {
  const { colors, isDark } = useTheme();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });
  const [stack, setStack] = useState<AdminRoute[]>([{ name: 'list' }]);
  const [kind, setKind] = useState<ContentKind>('chants');
  const route = stack[stack.length - 1];

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.surface }} />;
  }

  const nav: AdminNav = {
    push: (next) => setStack((current) => [...current, next]),
    back: () => setStack((current) => (current.length > 1 ? current.slice(0, -1) : current)),
  };

  return (
    <DatabaseProvider>
      <AdminNavContext.Provider value={nav}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {route.name === 'list' ? (
          <AdminListScreen kind={kind} onKindChange={setKind} />
        ) : (
          <AdminEditorScreen kind={route.kind} itemId={route.itemId} />
        )}
      </AdminNavContext.Provider>
    </DatabaseProvider>
  );
}
