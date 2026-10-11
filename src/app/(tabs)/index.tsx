import { greetingKey } from '../../i18n';
import { useApp } from '../../lib/AppContext';
import { MEALS, weekdayIndex } from '../../lib/menu';
import { MealRow } from '../../ui/MealRow';
import { BodyText, Card, Screen } from '../../ui/Screen';

export default function TodayScreen() {
  const { t, week, profile } = useApp();
  const day = week?.days[weekdayIndex(new Date())];
  return (
    <Screen title={t(greetingKey(new Date().getHours()))} subtitle={t('today.subtitle')}>
      {day ? (
        <Card>
          {MEALS.map((meal) => (
            <MealRow key={meal} meal={meal} slot={day[meal]} />
          ))}
        </Card>
      ) : null}
      {profile?.faithMoment ? (
        <Card>
          <BodyText>{t('moment.placeholder')}</BodyText>
        </Card>
      ) : null}
    </Screen>
  );
}
