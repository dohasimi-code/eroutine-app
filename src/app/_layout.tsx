import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from '../lib/AppContext';
import { s } from '../lib/strings';
import { colors } from '../ui/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
          headerBackTitle: s.back,
        }}
      >
        <Stack.Screen name="index" options={{ title: s.appName }} />
        <Stack.Screen name="new-event" options={{ title: s.newEvent, presentation: 'modal' }} />
        <Stack.Screen name="event/[id]" options={{ title: '' }} />
        <Stack.Screen name="camera/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="photo/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      </Stack>
    </AppProvider>
  );
}
