import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useApp } from '../lib/AppContext';
import { MAX_ENTRY_LENGTH, formatEntryDate } from '../lib/moment';
import { Button } from '../ui/Choice';
import { BodyText, Card, Screen } from '../ui/Screen';
import { colors, fontSize, spacing } from '../ui/theme';

export default function JournalScreen() {
  const { t, language, journal, addJournalEntry, deleteJournalEntry } = useApp();
  const [text, setText] = useState('');

  async function save() {
    if (await addJournalEntry(text)) setText('');
  }

  function confirmDelete(id: string) {
    Alert.alert(t('journal.delete.confirm'), undefined, [
      { text: t('journal.delete.cancel'), style: 'cancel' },
      { text: t('journal.delete'), style: 'destructive', onPress: () => deleteJournalEntry(id) },
    ]);
  }

  return (
    <Screen title={t('journal.title')} subtitle={t('moment.private')}>
      <Card>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('journal.placeholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={MAX_ENTRY_LENGTH}
          style={styles.input}
          accessibilityLabel={t('journal.placeholder')}
        />
        <View style={styles.row}>
          <Button label={t('journal.save')} onPress={save} />
        </View>
      </Card>

      {journal.length === 0 ? <BodyText muted>{t('journal.empty')}</BodyText> : null}
      {journal.map((entry) => (
        <Card key={entry.id}>
          <View style={styles.header}>
            <Text style={styles.date}>{formatEntryDate(entry.createdAt, language)}</Text>
            <Pressable onPress={() => confirmDelete(entry.id)} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.delete}>{t('journal.delete')}</Text>
            </Pressable>
          </View>
          <BodyText>{entry.text}</BodyText>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: fontSize.body,
    color: colors.text,
    lineHeight: 24,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  row: { flexDirection: 'row' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: fontSize.small, color: colors.textMuted },
  delete: { fontSize: fontSize.small, color: colors.accent, fontWeight: '600' },
});
