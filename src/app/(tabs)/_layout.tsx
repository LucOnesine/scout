import { Tabs } from 'expo-router';
import { TabBar } from '../../components/TabBar';
import { useTheme } from '../../context/SettingsContext';

export const unstable_settings = {
  anchor: 'code',
};

export default function TabsLayout() {
  const { colors, t } = useTheme();
  return (
    <Tabs
      backBehavior="initialRoute"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="code" options={{ title: t.tabCode }} />
      <Tabs.Screen name="koja" options={{ title: t.tabKoja }} />
      <Tabs.Screen name="teknika" options={{ title: t.tabTeknika }} />
      <Tabs.Screen name="hira" options={{ title: t.tabHira }} />
    </Tabs>
  );
}
