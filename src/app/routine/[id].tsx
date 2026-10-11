import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useApp } from '../../lib/AppContext';
import {
  MAX_NAME_LENGTH,
  PHRASE_IDS,
  REMINDER_PHRASES,
  blankRoutine,
  formatTime,
  type Routine,
  type RoutineDays,
} from '../../lib/routines';
import { Button, Choice } from '../../ui/Choice';
import { BodyText, Screen } from '../../ui/Screen';
import { colors, fontSize, spacing } from '../../ui/theme';

const MINUTES = [0, 15, 30, 45];
const DEFAULT_REMINDER = { hour: 7, minute: 30, phrase: 'minute' } as const;

export default function RoutineScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { t, language, routines, saveRoutine, deleteRoutine } = useApp();
  const existing = routines.find((r) => r.id === id);
  const [draft, setDraft] = useState<Routine>(() => existing ?? blankRoutine(name ?? ''));
  const [invalid, setInvalid] = useState(false);

  const update = (patch: Partial<Routine>) => setDraft((current) => ({ ...current, ...patch }));
  const setDays = (days: RoutineDays) => update({ days, reminder: days.kind === 'whenever' ? null : draft.reminder });
  const reminder = draft.reminder;
  const pickedWeekdays = draft.days.kind === 'some' ? draft.days.weekdays : [];

  function toggleWeekday(day: number) {
    const weekdays = pickedWeekdays.includes(day) ? pickedWeekdays.filter((d) => d !== day) : [...pickedWeekdays, day];
    update({ days: { kind: 'some', weekdays } });
  }

  async function save() {
    const result = await saveRoutine(draft);
    if (result === 'invalid') {
      setInvalid(true);
      return;
    }
    if (result === 'blocked') Alert.alert(t('routine.reminder'), t('routine.reminder.blocked'));
    router.back();
  }

  function confirmDelete() {
    Alert.alert(t('routine.delete.confirm'), undefined, [
      { text: t('routine.cancel'), style: 'cancel' },
      {
        text: t('routine.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteRoutine(draft.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen title={existing ? t('routine.edit') : t('routine.new')}>
      <Text style={styles.label}>{t('routine.name')}</Text>
      <TextInput
        value={draft.name}
        onChangeText={(text) => {
          update({ name: text });
          setInvalid(false);
        }}
        placeholder={t('routine.name.placeholder')}
        placeholderTextColor={colors.textMuted}
        maxLength={MAX_NAME_LENGTH}
        style={styles.input}
        accessibilityLabel={t('routine.name')}
      />
      {invalid ? <Text style={styles.warning}>{t('routine.invalid')}</Text> : null}

      <Text style={styles.label}>{t('routine.days')}</Text>
      <Choice label={t('routine.days.every')} selected={draft.days.kind === 'every'} onPress={() => setDays({ kind: 'every' })} />
      <Choice
        label={t('routine.days.some')}
        selected={draft.days.kind === 'some'}
        onPress={() => setDays({ kind: 'some', weekdays: pickedWeekdays })}
      />
      {draft.days.kind === 'some' ? (
        <View style={styles.chips}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <Chip
              key={day}
              label={t(`weekday.short.${day}` as 'weekday.short.0')}
              selected={pickedWeekdays.includes(day)}
              onPress={() => toggleWeekday(day)}
              multiple
            />
          ))}
        </View>
      ) : null}
      <Choice label={t('routine.days.whenever')} selected={draft.days.kind === 'whenever'} onPress={() => setDays({ kind: 'whenever' })} />

      <Text style={styles.label}>{t('routine.reminder')}</Text>
      {draft.days.kind === 'whenever' ? (
        <BodyText muted>{t('routine.reminder.whenever')}</BodyText>
      ) : (
        <>
          <Choice label={t('routine.reminder.off')} selected={reminder === null} onPress={() => update({ reminder: null })} />
          <Choice label={t('routine.reminder.on')} selected={reminder !== null} onPress={() => update({ reminder: reminder ?? DEFAULT_REMINDER })} />
        </>
      )}

      {reminder && draft.days.kind !== 'whenever' ? (
        <>
          <Text style={styles.label}>{t('routine.reminder.time')}</Text>
          <View style={styles.time}>
            <Chip label="−" selected={false} onPress={() => update({ reminder: { ...reminder, hour: (reminder.hour + 23) % 24 } })} />
            <Text style={styles.timeValue}>{formatTime(reminder.hour, reminder.minute)}</Text>
            <Chip label="+" selected={false} onPress={() => update({ reminder: { ...reminder, hour: (reminder.hour + 1) % 24 } })} />
          </View>
          <View style={styles.chips}>
            {MINUTES.map((minute) => (
              <Chip
                key={minute}
                label={`:${String(minute).padStart(2, '0')}`}
                selected={reminder.minute === minute}
                onPress={() => update({ reminder: { ...reminder, minute } })}
              />
            ))}
          </View>
          <Text style={styles.label}>{t('routine.reminder.phrase')}</Text>
          {PHRASE_IDS.map((phrase) => (
            <Choice
              key={phrase}
              label={REMINDER_PHRASES[phrase][language]}
              selected={reminder.phrase === phrase}
              onPress={() => update({ reminder: { ...reminder, phrase } })}
            />
          ))}
          <BodyText muted>{t('routine.private')}</BodyText>
        </>
      ) : null}

      <View style={styles.buttons}>
        <Button variant="quiet" label={t('routine.cancel')} onPress={() => router.back()} />
        <Button label={t('routine.save')} onPress={save} />
      </View>
      {existing ? <Button variant="quiet" label={t('routine.delete')} onPress={confirmDelete} /> : null}
    </Screen>
  );
}

function Chip({ label, selected, onPress, multiple }: { label: string; selected: boolean; onPress(): void; multiple?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multiple ? 'checkbox' : 'button'}
      accessibilityState={multiple ? { checked: selected } : undefined}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: fontSize.small, color: colors.textMuted, marginTop: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSize.body,
    color: colors.text,
  },
  warning: { fontSize: fontSize.small, color: colors.accent },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minWidth: 48,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.body, color: colors.text },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  time: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  timeValue: { fontSize: fontSize.title, fontWeight: '600', color: colors.text, minWidth: 90, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
