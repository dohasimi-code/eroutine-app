import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { MEAL_PRAYERS, PLAN } from '../../data/plan';
import { greetingKey } from '../../i18n';
import { useApp } from '../../lib/AppContext';
import { weekdayIndex } from '../../lib/menu';
import { currentDayIndex, isPlanFinished } from '../../lib/moment';
import { DayMeals } from '../../ui/DayMeals';
import { Card, Screen } from '../../ui/Screen';
import { colors, fontSize } from '../../ui/theme';

export default function TodayScreen() {
  const { t, language, week, profile, progress } = useApp();
  const weekday = weekdayIndex(new Date());
  const day = week?.days[weekday];
  return (
    <Screen title={t(greetingKey(new Date().getHours()))} subtitle={t('today.subtitle')}>
      {day ? <DayMeals dayIndex={weekday} /> : null}
      {profile?.faithMoment ? (
        <>
          <Card>
            <Text style={styles.heading}>{t('today.mealPrayer')}</Text>
            <Text style={styles.prayer}>{MEAL_PRAYERS[weekday][language]}</Text>
          </Card>
          {!isPlanFinished(progress) ? (
            <Pressable onPress={() => router.navigate('/moment')} accessibilityRole="link">
              <Card>
                <Text style={styles.link}>{t('today.moment', { theme: PLAN[currentDayIndex(progress)].theme[language] })}</Text>
              </Card>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  prayer: { fontSize: fontSize.body, color: colors.text, lineHeight: 24, fontStyle: 'italic' },
  link: { fontSize: fontSize.body, color: colors.primary, fontWeight: '600' },
});
