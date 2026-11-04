import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BookOpen, CodeXml, Compass, Music } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, type ThemeColors, themed } from '../theme/theme';
import type { TextKey } from '../i18n/messages';
import { useTheme } from '../context/SettingsContext';

type IconComponent = ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

const TAB_ITEMS: Record<string, IconComponent> = {
  code: CodeXml,
  koja: BookOpen,
  teknika: Compass,
  hira: Music,
};

const TAB_LABELS: Record<string, TextKey> = {
  code: 'tabCode',
  koja: 'tabKoja',
  teknika: 'tabTeknika',
  hira: 'tabHira',
};

export function TabBar({ state, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const { colors, t } = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 8 }]}>
      {state.routes.map((route, index) => {
        const Icon = TAB_ITEMS[route.name];
        const labelKey = TAB_LABELS[route.name];
        if (!Icon || !labelKey) return null;
        const label: string = t[labelKey];

        const focused = state.index === index;
        const onPress = () => {
          const event = emitter.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigateToTab(route.key);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={label}
          >
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Icon
                size={22}
                color={focused ? colors.primaryDark : colors.gray}
                strokeWidth={focused ? 2.5 : 1.6}
              />
            </View>
            <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
            {focused && <View style={styles.dot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = themed((colors: ThemeColors) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  iconWrap: {
    padding: 7,
    borderRadius: 14,
  },
  iconWrapActive: {
    backgroundColor: colors.border,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.gray,
  },
  labelActive: {
    color: colors.primaryDark,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
}));
