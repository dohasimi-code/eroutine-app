import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, type ColorValue } from 'react-native';

import { useApp } from '../../lib/AppContext';
import { colors } from '../../ui/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} color={color} size={size} />;
}

function SettingsButton() {
  const { t } = useApp();
  return (
    <Link href="/settings" asChild>
      <Pressable accessibilityLabel={t('settings.title')} hitSlop={12} style={{ marginRight: 16 }}>
        <Ionicons name="settings-outline" size={24} color={colors.text} />
      </Pressable>
    </Link>
  );
}

export default function TabLayout() {
  const { t } = useApp();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerRight: () => <SettingsButton />,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.today'), tabBarIcon: tabIcon('sunny-outline') }} />
      <Tabs.Screen name="menu" options={{ title: t('tabs.menu'), tabBarIcon: tabIcon('restaurant-outline') }} />
      <Tabs.Screen name="list" options={{ title: t('tabs.list'), tabBarIcon: tabIcon('basket-outline') }} />
      <Tabs.Screen name="moment" options={{ title: t('tabs.moment'), tabBarIcon: tabIcon('leaf-outline') }} />
    </Tabs>
  );
}
