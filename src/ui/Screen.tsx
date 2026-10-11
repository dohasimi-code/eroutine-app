import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing } from './theme';

export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </ScrollView>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function BodyText({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.text, muted && styles.muted]}>{children}</Text>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: fontSize.title, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: fontSize.body, color: colors.textMuted, marginTop: spacing.xs },
  body: { marginTop: spacing.lg, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  text: { fontSize: fontSize.body, color: colors.text, lineHeight: 24 },
  muted: { color: colors.textMuted, fontSize: fontSize.small },
});
