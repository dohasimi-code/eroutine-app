import { useLocalSearchParams } from 'expo-router';

import { useApp } from '../../lib/AppContext';
import { DayMeals } from '../../ui/DayMeals';
import { Screen } from '../../ui/Screen';

export default function DayScreen() {
  const { index } = useLocalSearchParams<{ index: string }>();
  const { t } = useApp();
  const dayIndex = Math.min(6, Math.max(0, Number(index) || 0));
  return (
    <Screen title={t(`day.${dayIndex}` as 'day.0')}>
      <DayMeals dayIndex={dayIndex} />
    </Screen>
  );
}
