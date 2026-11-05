import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useApp } from '../lib/AppContext';
import { SHOT_OPTIONS } from '../lib/config';
import { isValidDate } from '../lib/logic';
import { s } from '../lib/strings';
import type { RevealMode } from '../lib/types';
import { Button } from '../ui/components';
import { colors, radius, space } from '../ui/theme';

function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[styles.chip, on && styles.chipOn]}
    >
      <Text style={[styles.chipText, on && { color: colors.onAccent }]}>{label}</Text>
    </Pressable>
  );
}

export default function NewEvent() {
  const { createEvent } = useApp();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [shots, setShots] = useState<number>(24);
  const [reveal, setReveal] = useState<RevealMode>('instant');
  const [error, setError] = useState('');

  async function submit() {
    if (!title.trim()) return setError(s.errTitle);
    if (!isValidDate(date.trim())) return setError(s.errDate);
    const ev = await createEvent({ title: title.trim(), date: date.trim(), shotsPerGuest: shots, reveal });
    router.replace(`/event/${ev.id}`);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{s.coupleLabel}</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder={s.couplePh} placeholderTextColor={colors.muted} />

        <Text style={styles.label}>{s.dateLabel}</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2027-06-12"
          placeholderTextColor={colors.muted}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        <Text style={styles.label}>{s.shotsLabel}</Text>
        <View style={styles.row}>
          {SHOT_OPTIONS.map((n) => (
            <Chip key={n} label={String(n)} on={shots === n} onPress={() => setShots(n)} />
          ))}
        </View>

        <Text style={styles.label}>{s.revealLabel}</Text>
        <View style={styles.row}>
          <Chip label={s.revealInstant} on={reveal === 'instant'} onPress={() => setReveal('instant')} />
          <Chip label={s.revealAfter} on={reveal === 'after'} onPress={() => setReveal('after')} />
        </View>
        {reveal === 'after' && <Text style={styles.hint}>{s.revealAfterHint}</Text>}

        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button label={s.save} onPress={submit} style={{ marginTop: space.lg }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  body: { padding: space.md, gap: space.sm },
  label: { fontWeight: '600', color: colors.text, marginTop: space.sm },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    fontSize: 16,
    color: colors.text,
  },
  row: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  chip: {
    minHeight: 44,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontWeight: '600', color: colors.text },
  hint: { color: colors.muted },
  error: { color: colors.danger, marginTop: space.sm },
});
