import { getLocales } from 'expo-localization';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { PLAN, PLAN_TITLE } from '../../data/plan';
import { useApp } from '../../lib/AppContext';
import { canShowKjv, currentDayIndex, doneToday, formatReference, isPlanFinished, isWelcomeBack } from '../../lib/moment';
import { todayIso } from '../../lib/shopping';
import { Button } from '../../ui/Choice';
import { BodyText, Card, Screen } from '../../ui/Screen';
import { colors, fontSize } from '../../ui/theme';

export default function MomentScreen() {
  const { t, language, progress, completeToday, restartPlan, journal } = useApp();
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

      <BodyText muted>{t('moment.draft')}</BodyText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  theme: { fontSize: fontSize.heading, fontWeight: '600', color: colors.primary },
  reference: { fontSize: fontSize.body, color: colors.text, fontWeight: '500' },
  prayer: { fontSize: fontSize.body, color: colors.text, lineHeight: 24, fontStyle: 'italic' },
});
