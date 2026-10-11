import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { LANGUAGES } from '../i18n';
import { useApp } from '../lib/AppContext';
import { BodyText, Card, Screen } from '../ui/Screen';
import { colors, fontSize, spacing } from '../ui/theme';

export default function SettingsScreen() {
  const { t, language, setLanguage, profile, resetAllData } = useApp();

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
                minutes: profile.maxCookMinutes,
                budget: t(`onboarding.budget.${profile.budget}`),
              })}
            </BodyText>
          </Card>
        </Pressable>
      ) : null}

      <Card>
        <Text style={styles.heading}>{t('settings.privacy.title')}</Text>
        <BodyText>{t('settings.privacy.body')}</BodyText>
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
});
