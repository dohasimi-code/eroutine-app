import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LANGUAGES, type TranslationKey } from '../i18n';
import { useApp } from '../lib/AppContext';
import {
  BUDGET_OPTIONS,
  DEFAULT_PROFILE,
  EXCLUSION_OPTIONS,
  MAX_PEOPLE,
  MIN_PEOPLE,
  clampPeople,
  toggleExclusion,
  type FamilyProfile,
} from '../lib/profile';
import { BodyText, Screen } from '../ui/Screen';
import { Button, Choice } from '../ui/Choice';
import { colors, fontSize, spacing } from '../ui/theme';

const STEPS = ['language', 'people', 'budget', 'exclusions', 'faith'] as const;
type Step = (typeof STEPS)[number];

const STEP_TITLES: Record<Step, TranslationKey> = {
  language: 'onboarding.language.title',
  people: 'onboarding.people.title',
  budget: 'onboarding.budget.title',
  exclusions: 'onboarding.exclusions.title',
  faith: 'onboarding.faith.title',
};

export default function OnboardingScreen() {
  const { t, language, setLanguage, profile, saveProfile } = useApp();
  // "edit" means it was opened from Settings to change an existing profile.
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = edit === '1';
  const [index, setIndex] = useState(editing ? 1 : 0);
  const [draft, setDraft] = useState<FamilyProfile>(profile ?? DEFAULT_PROFILE);

  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;
  const update = (patch: Partial<FamilyProfile>) => setDraft((current) => ({ ...current, ...patch }));

  async function finish(final: FamilyProfile) {
    await saveProfile(final);
    if (editing) router.back();
    else router.replace('/');
  }

  function next() {
    if (isLast) finish(draft);
    else setIndex(index + 1);
  }

  // Skipping keeps whatever default or earlier answer this step already has.
  function skip() {
    next();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Screen
        title={index === 0 ? t('onboarding.welcome.title') : t(STEP_TITLES[step])}
        subtitle={index === 0 ? t('onboarding.welcome.body') : t('onboarding.step', { current: index + 1, total: STEPS.length })}
      >
        {index === 0 ? <Text style={styles.question}>{t(STEP_TITLES[step])}</Text> : null}

        {step === 'language' &&
          LANGUAGES.map(({ code, label }) => (
            <Choice key={code} label={label} selected={language === code} onPress={() => setLanguage(code)} />
          ))}

        {step === 'people' && (
          <View style={styles.stepper}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.people.less')}
              disabled={draft.people <= MIN_PEOPLE}
              onPress={() => update({ people: clampPeople(draft.people - 1) })}
              style={styles.stepperButton}
            >
              <Text style={styles.stepperSign}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue} accessibilityLiveRegion="polite">
              {draft.people >= MAX_PEOPLE ? `${MAX_PEOPLE}+` : draft.people}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.people.more')}
              disabled={draft.people >= MAX_PEOPLE}
              onPress={() => update({ people: clampPeople(draft.people + 1) })}
              style={styles.stepperButton}
            >
              <Text style={styles.stepperSign}>+</Text>
            </Pressable>
          </View>
        )}

        {step === 'budget' &&
          BUDGET_OPTIONS.map((budget) => (
            <Choice
              key={budget}
              label={t(`onboarding.budget.${budget}`)}
              hint={t(`onboarding.budget.${budget}.hint`)}
              selected={draft.budget === budget}
              onPress={() => update({ budget })}
            />
          ))}

        {step === 'exclusions' && (
          <>
            {EXCLUSION_OPTIONS.map((item) => (
              <Choice
                key={item}
                multiple
                label={t(`exclusion.${item}`)}
                selected={draft.exclusions.includes(item)}
                onPress={() => update({ exclusions: toggleExclusion(draft.exclusions, item) })}
              />
            ))}
            <BodyText muted>{t('onboarding.exclusions.hint')}</BodyText>
          </>
        )}

        {step === 'faith' && (
          <>
            <Choice label={t('onboarding.faith.yes')} selected={draft.faithMoment} onPress={() => update({ faithMoment: true })} />
            <Choice label={t('onboarding.faith.later')} selected={!draft.faithMoment} onPress={() => update({ faithMoment: false })} />
            <BodyText muted>{t('onboarding.faith.hint')}</BodyText>
          </>
        )}

        <View style={styles.actions}>
          {index > 0 ? <Button variant="quiet" label={t('onboarding.back')} onPress={() => setIndex(index - 1)} /> : null}
          <Button label={isLast ? t('onboarding.finish') : t('onboarding.next')} onPress={next} />
        </View>
        {!isLast ? (
          <Pressable onPress={skip} accessibilityRole="button" style={styles.skip}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </Pressable>
        ) : null}
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  question: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  stepperButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSign: { fontSize: 28, color: colors.text },
  stepperValue: { fontSize: 40, fontWeight: '600', color: colors.text, minWidth: 64, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  skip: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: { fontSize: fontSize.body, color: colors.textMuted, textDecorationLine: 'underline' },
});
