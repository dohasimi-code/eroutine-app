import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from '../lib/AppContext';
import { colors } from '../ui/theme';

function RootStack() {
  const { t } = useApp();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="recipe/[id]" options={{ title: '', headerBackTitle: t('tabs.menu') }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootStack />
    </AppProvider>
  );
}
