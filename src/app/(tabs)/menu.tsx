import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../lib/AppContext';
import { MEALS, getRecipe, weekdayIndex } from '../../lib/menu';
import { Button } from '../../ui/Choice';
import { BodyText, Card, Screen } from '../../ui/Screen';
import { colors, fontSize, spacing } from '../../ui/theme';

// The week at a glance. Choosing and cooking happen on the day itself, one place only.
export default function WeekScreen() {
  const { t, language, week, newWeek } = useApp();
  const today = weekdayIndex(new Date());
  if (!week) return null;

  return (
    <Screen title={t('week.title')} subtitle={t('week.hint')}>
      {week.days.map((day, dayIndex) => (
        <Pressable
          key={dayIndex}
          onPress={() => (dayIndex === today ? router.navigate('/') : router.push({ pathname: '/day/[index]', params: { index: String(dayIndex) } }))}
          accessibilityRole="button"
        >
          <Card>
            <View style={styles.header}>
              <Text style={[styles.day, dayIndex === today && styles.today]}>
                {t(`day.${dayIndex}` as 'day.0')}
                {dayIndex === today ? ` · ${t('day.today')}` : ''}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
            {MEALS.map((meal) => {
              const slot = day[meal];
              const name = slot.kind === 'empty' ? '–' : getRecipe(slot.recipeId)!.name[language];
              return (
                <View key={meal} style={styles.row}>
                  <Text style={styles.meal}>{t(`meal.${meal}`)}</Text>
                  <Text style={[styles.name, slot.kind !== 'empty' && slot.done && styles.done]} numberOfLines={1}>
                    {name}
                  </Text>
                  {slot.kind !== 'empty' && slot.done ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                </View>
              );
            })}
          </Card>
        </Pressable>
      ))}
      <Button label={t('menu.newWeek')} onPress={() => newWeek()} />
      <BodyText muted>{t('menu.newWeek.hint')}</BodyText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  day: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  today: { color: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meal: { width: 72, fontSize: fontSize.small, color: colors.textMuted },
  name: { flex: 1, fontSize: fontSize.body, color: colors.text },
  done: { color: colors.textMuted, textDecorationLine: 'line-through' },
});
