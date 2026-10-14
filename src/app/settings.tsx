import { router } from 'expo-router';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { LANGUAGES } from '../i18n';
import { useApp } from '../lib/AppContext';
import { DINNER_STYLES } from '../lib/menu';
import { Choice } from '../ui/Choice';
import { BodyText, Card, Screen } from '../ui/Screen';
import { colors, fontSize, spacing } from '../ui/theme';

const STORED_KEYS = [
  'settings.privacy.item.profile',
  'settings.privacy.item.menu',
  'settings.privacy.item.list',
  'settings.privacy.item.faith',
  'settings.privacy.item.routines',
] as const;

export default function SettingsScreen() {
  const { t, language, setLanguage, profile, resetAllData, week, newWeek, pantry } = useApp();

  function confirmDelete() {
    Alert.alert(t('settings.delete.confirmTitle'), t('settings.delete.confirmBody'), [
      { text: t('settings.delete.cancel'), style: 'cancel' },
      {
        text: t('settings.delete.confirm'),
        style: 'destructive',
        onPress: async () => {
          await resetAllData();
          Alert.alert(t('settings.delete.done'));
          // Without a profile the app starts again from the first-run questions.
          router.replace('/onboarding');
        },
      },
    ]);
  }

  return (
    <Screen title={t('settings.title')}>
      <Card>
        <Text style={styles.heading}>{t('settings.language')}</Text>
        <View style={styles.row}>
          {LANGUAGES.map(({ code, label }) => {
            const selected = code === language;
            return (
              <Pressable
                key={code}
                onPress={() => setLanguage(code)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.choice, selected && styles.choiceSelected]}
              >
                <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {profile ? (
        <Pressable onPress={() => router.push('/onboarding?edit=1')} accessibilityRole="button">
          <Card>
            <Text style={styles.heading}>{t('settings.profile')}</Text>
            <BodyText muted>
              {t('settings.profile.summary', {
                people: profile.people,
                budget: t(`onboarding.budget.${profile.budget}`),
              })}
            </BodyText>
          </Card>
        </Pressable>
      ) : null}

      {week ? (
        <Card>
          <Text style={styles.heading}>{t('week.dinners')}</Text>
          {DINNER_STYLES.map((style) => (
            <Choice key={style} label={t(`dinnerStyle.${style}`)} selected={week.dinnerStyle === style} onPress={() => newWeek(style)} />
          ))}
        </Card>
      ) : null}

      <Pressable onPress={() => router.push('/pantry')} accessibilityRole="button">
        <Card>
          <Text style={styles.heading}>{t('week.pantry')}</Text>
          <BodyText muted>{pantry.length > 0 ? t('pantry.summary', { n: pantry.length }) : t('pantry.empty')}</BodyText>
        </Card>
      </Pressable>

      <Card>
        <Text style={styles.heading}>{t('settings.reminders')}</Text>
        <BodyText muted>{t('settings.reminders.body')}</BodyText>
        <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button">
          <Text style={styles.link}>{t('settings.reminders.open')}</Text>
        </Pressable>
      </Card>

      <Card>
        <Text style={styles.heading}>{t('settings.privacy.title')}</Text>
        <BodyText>{t('settings.privacy.body')}</BodyText>
        <BodyText muted>{t('settings.privacy.stored')}</BodyText>
        {STORED_KEYS.map((key) => (
          <BodyText key={key}>{`• ${t(key)}`}</BodyText>
        ))}
        <BodyText muted>{t('settings.privacy.notCollected')}</BodyText>
        <Pressable onPress={confirmDelete} accessibilityRole="button" style={styles.deleteButton}>
          <Text style={styles.deleteText}>{t('settings.delete')}</Text>
        </Pressable>
      </Card>

      <BodyText muted>{t('settings.disclaimer')}</BodyText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  row: { flexDirection: 'row', gap: spacing.sm },
  choice: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  choiceSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { fontSize: fontSize.body, color: colors.text },
  choiceTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  deleteButton: {
    marginTop: spacing.sm,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  deleteText: { fontSize: fontSize.body, color: colors.accent, fontWeight: '600' },
  link: { fontSize: fontSize.body, color: colors.primary, fontWeight: '600' },
});
