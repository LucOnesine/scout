import { Stack } from 'expo-router';
import { useTheme } from '../../../context/SettingsContext';

export default function HiraStackLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
