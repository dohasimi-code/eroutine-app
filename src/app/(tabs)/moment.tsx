import { getLocales } from 'expo-localization';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { PLAN, PLAN_TITLE } from '../../data/plan';
import { useApp } from '../../lib/AppContext';
import { canShowKjv, currentDayIndex, doneToday, formatReference, isPlanFinished, isWelcomeBack } from '../../lib/moment';
import { ROUTINE_TEMPLATES, formatTime, type Routine } from '../../lib/routines';
import { todayIso } from '../../lib/shopping';
import { Button } from '../../ui/Choice';
import { BodyText, Card, Screen } from '../../ui/Screen';
import { colors, fontSize, spacing } from '../../ui/theme';

export default function MomentScreen() {
  const { t, language, progress, completeToday, restartPlan, journal, routines, toggleRoutine } = useApp();
  const today = todayIso();
  const dayIndex = currentDayIndex(progress);
  const day = PLAN[dayIndex];
  const finished = isPlanFinished(progress);
  const showKjv = canShowKjv(language, getLocales()[0]?.regionCode);
  const plan = PLAN_TITLE[language];
  // After today's day is done she can still read ahead, but is never pushed to.
  const [readAhead, setReadAhead] = useState(false);

  return (
    <Screen
      title={t('moment.title')}
      subtitle={finished ? plan : `${plan} · ${t('moment.day', { n: dayIndex + 1, total: PLAN.length })}`}
    >
      {isWelcomeBack(progress, today) && !doneToday(progress, today) ? (
        <Card>
          <Text style={styles.heading}>{t('moment.welcomeBack')}</Text>
          <BodyText muted>{t('moment.welcomeBack.body')}</BodyText>
        </Card>
      ) : null}

      {finished ? (
        <Card>
          <BodyText>{t('moment.finished', { plan })}</BodyText>
          <Button variant="quiet" label={t('moment.restart')} onPress={restartPlan} />
        </Card>
      ) : doneToday(progress, today) && !readAhead ? (
        <Card>
          <BodyText>{t('moment.doneToday', { n: progress.done + 1 })}</BodyText>
          <Button variant="quiet" label={t('moment.next')} onPress={() => setReadAhead(true)} />
        </Card>
      ) : (
        <>
          <Card>
            <Text style={styles.theme}>{day.theme[language]}</Text>
            <Text style={styles.reference}>{formatReference(day.passage, language)}</Text>
            {showKjv ? (
              <Button
                variant="quiet"
                label={t('moment.read')}
                onPress={() => router.push({ pathname: '/reading/[day]', params: { day: String(dayIndex) } })}
              />
            ) : (
              <BodyText muted>{t('moment.readOwnBible')}</BodyText>
            )}
          </Card>
          <Card>
            <Text style={styles.heading}>{t('moment.reflection')}</Text>
            <BodyText>{day.reflection[language]}</BodyText>
          </Card>
          <Card>
            <Text style={styles.heading}>{t('moment.prayer')}</Text>
            <Text style={styles.prayer}>{day.prayer[language]}</Text>
          </Card>
          <Button
            label={t('moment.done')}
            onPress={() => {
              setReadAhead(false);
              completeToday();
            }}
          />
        </>
      )}

      <Card>
        <Text style={styles.heading}>{t('moment.journal')}</Text>
        {journal.length > 0 ? <BodyText muted>{t('moment.journal.count', { n: journal.length })}</BodyText> : null}
        <Button variant="quiet" label={t('moment.journal.open')} onPress={() => router.push('/journal')} />
        <BodyText muted>{t('moment.private')}</BodyText>
      </Card>

      <Card>
        <Text style={styles.heading}>{t('routine.section')}</Text>
        {routines.length === 0 ? (
          <>
            <BodyText muted>{t('routine.empty')}</BodyText>
            {ROUTINE_TEMPLATES.map((template) => (
              <Pressable
                key={template.en}
                onPress={() => router.push({ pathname: '/routine/[id]', params: { id: 'new', name: template[language] } })}
                accessibilityRole="button"
              >
                <Text style={styles.link}>{`+ ${template[language]}`}</Text>
              </Pressable>
            ))}
          </>
        ) : (
          routines.map((routine) => (
            <View key={routine.id} style={styles.routine}>
              <Pressable
                style={styles.routineMain}
                onPress={() => router.push({ pathname: '/routine/[id]', params: { id: routine.id } })}
                accessibilityRole="button"
              >
                <Text style={[styles.routineName, !routine.active && styles.muted]}>{routine.name}</Text>
                <Text style={styles.routineDetail}>{summary(routine)}</Text>
              </Pressable>
              <Switch
                value={routine.active}
                onValueChange={async () => {
                  if ((await toggleRoutine(routine.id)) === 'blocked') Alert.alert(t('routine.reminder'), t('routine.reminder.blocked'));
                }}
                trackColor={{ true: colors.primary, false: colors.border }}
                accessibilityLabel={`${routine.name}: ${t('routine.active')}`}
              />
            </View>
          ))
        )}
        <Button variant="quiet" label={t('routine.add')} onPress={() => router.push({ pathname: '/routine/[id]', params: { id: 'new' } })} />
      </Card>

      <BodyText muted>{t('moment.draft')}</BodyText>
    </Screen>
  );

  function summary(routine: Routine): string {
    const days =
      routine.days.kind === 'every'
        ? t('routine.summary.every')
        : routine.days.kind === 'whenever'
          ? t('routine.summary.whenever')
          : routine.days.weekdays.map((d) => t(`weekday.short.${d}` as 'weekday.short.0')).join(', ');
    if (routine.days.kind === 'whenever') return days;
    return `${days} · ${routine.reminder ? formatTime(routine.reminder.hour, routine.reminder.minute) : t('routine.summary.noReminder')}`;
  }
}

const styles = StyleSheet.create({
  heading: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  theme: { fontSize: fontSize.heading, fontWeight: '600', color: colors.primary },
  reference: { fontSize: fontSize.body, color: colors.text, fontWeight: '500' },
  prayer: { fontSize: fontSize.body, color: colors.text, lineHeight: 24, fontStyle: 'italic' },
  link: { fontSize: fontSize.body, color: colors.primary, fontWeight: '600', paddingVertical: spacing.xs },
  routine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  routineMain: { flex: 1, gap: 2 },
  routineName: { fontSize: fontSize.body, color: colors.text, fontWeight: '500' },
  routineDetail: { fontSize: fontSize.small, color: colors.textMuted },
  muted: { color: colors.textMuted },
});
