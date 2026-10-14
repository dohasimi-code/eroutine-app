import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../lib/AppContext';
import { MEALS, cooksForTomorrow, getRecipe, totalMinutes, type Meal } from '../lib/menu';
import { Card } from './Screen';
import { colors, fontSize, spacing } from './theme';

// One day's meals as a clear path: pick one of three dishes, open how to cook it, tick it done.
export function DayMeals({ dayIndex }: { dayIndex: number }) {
  const { week } = useApp();
  if (!week) return null;
  return (
    <>
      {MEALS.map((meal) => (
        <MealCard key={meal} dayIndex={dayIndex} meal={meal} />
      ))}
    </>
  );
}

function MealCard({ dayIndex, meal }: { dayIndex: number; meal: Meal }) {
  const { t, language, week, chooseMeal, markDone, showOtherOptions } = useApp();
  const slot = week!.days[dayIndex][meal];
  const openRecipe = (id: string) => router.push({ pathname: '/recipe/[id]', params: { id, day: String(dayIndex), meal } });

  if (slot.kind === 'empty') {
    return (
      <Card>
        <Text style={styles.meal}>{t(`meal.${meal}`)}</Text>
        <Text style={styles.muted}>{t('meal.empty')}</Text>
      </Card>
    );
  }

  const chosen = getRecipe(slot.recipeId)!;

  if (slot.done) {
    return (
      <Card>
        <View style={styles.doneRow}>
          <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
          <View style={styles.flex}>
            <Text style={styles.meal}>{`${t(`meal.${meal}`)} · ${t('meal.done')}`}</Text>
            <Text style={styles.doneName}>{chosen.name[language]}</Text>
          </View>
          <Pressable onPress={() => markDone(dayIndex, meal, false)} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.link}>{t('meal.undo')}</Text>
          </Pressable>
        </View>
      </Card>
    );
  }

  if (slot.kind === 'leftovers') {
    return (
      <Card>
        <Text style={styles.meal}>{t(`meal.${meal}`)}</Text>
        <Text style={styles.name}>{chosen.name[language]}</Text>
        <Text style={styles.muted}>{`${t('meal.leftovers')} · ${t('meal.leftovers.hint')}`}</Text>
        <Actions onHowTo={() => openRecipe(chosen.id)} onDone={() => markDone(dayIndex, meal, true)} />
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.meal}>{`${t(`meal.${meal}`)} · ${t('meal.pick')}`}</Text>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {slot.options.map((id) => {
          const recipe = getRecipe(id)!;
          const selected = id === slot.recipeId;
          return (
            <Pressable
              key={id}
              onPress={() => chooseMeal(dayIndex, meal, id)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.primary : colors.textMuted} />
              <Text style={[styles.optionName, selected && styles.optionNameSelected]}>{recipe.name[language]}</Text>
              <Text style={styles.minutes}>{t('meal.minutes', { n: totalMinutes(recipe) })}</Text>
            </Pressable>
          );
        })}
      </View>
      {chosen.soakHours ? <Text style={styles.muted}>{t('meal.soak', { n: chosen.soakHours })}</Text> : null}
      {meal === 'lunch' && cooksForTomorrow(week!, dayIndex) ? <Text style={styles.muted}>{t('meal.cookExtra')}</Text> : null}
      <Actions onHowTo={() => openRecipe(chosen.id)} onDone={() => markDone(dayIndex, meal, true)} />
      <Pressable onPress={() => showOtherOptions(dayIndex, meal)} accessibilityRole="button" hitSlop={8}>
        <Text style={styles.others}>{t('meal.others')}</Text>
      </Pressable>
    </Card>
  );
}

function Actions({ onHowTo, onDone }: { onHowTo(): void; onDone(): void }) {
  const { t } = useApp();
  return (
    <View style={styles.actions}>
      <Pressable onPress={onHowTo} accessibilityRole="button" style={[styles.action, styles.actionQuiet]}>
        <Ionicons name="book-outline" size={18} color={colors.primary} />
        <Text style={styles.actionQuietText}>{t('meal.howTo')}</Text>
      </Pressable>
      <Pressable onPress={onDone} accessibilityRole="button" style={styles.action}>
        <Text style={styles.actionText}>{t('meal.markDone')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  meal: { fontSize: fontSize.small - 2, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: fontSize.heading, color: colors.text, fontWeight: '600' },
  muted: { fontSize: fontSize.small, color: colors.textMuted },
  options: { gap: spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.background },
  optionName: { flex: 1, fontSize: fontSize.body, color: colors.text },
  optionNameSelected: { fontWeight: '600' },
  minutes: { fontSize: fontSize.small, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  action: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  actionText: { fontSize: fontSize.body, color: '#FFFFFF', fontWeight: '600' },
  actionQuiet: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  actionQuietText: { fontSize: fontSize.body, color: colors.primary, fontWeight: '600' },
  others: { fontSize: fontSize.small, color: colors.primary, textAlign: 'center', paddingTop: spacing.xs },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  doneName: { fontSize: fontSize.body, color: colors.textMuted, textDecorationLine: 'line-through' },
  link: { fontSize: fontSize.small, color: colors.primary, fontWeight: '600' },
});
