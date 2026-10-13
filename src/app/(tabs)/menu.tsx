import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../lib/AppContext';
import {
  DINNER_STYLES,
  MEALS,
  alternativesFor,
  cooksForTomorrow,
  getRecipe,
  leftoverSource,
  seededRandom,
  totalMinutes,
  weekdayIndex,
  type Meal,
} from '../../lib/menu';
import type { Recipe } from '../../data/types';
import { Button, Choice } from '../../ui/Choice';
import { MealRow } from '../../ui/MealRow';
import { BodyText, Card } from '../../ui/Screen';
import { colors, fontSize, spacing } from '../../ui/theme';

type SwapTarget = { dayIndex: number; meal: Meal; options: Recipe[]; leftover: Recipe | null };

export default function MenuScreen() {
  const { t, language, week, profile, pantry, newWeek, setSlot, toggleLock } = useApp();
  const [swap, setSwap] = useState<SwapTarget | null>(null);
  const today = weekdayIndex(new Date());

  if (!week || !profile) return null;

  function openSwap(dayIndex: number, meal: Meal) {
    const options = alternativesFor(week!, dayIndex, meal, profile!, seededRandom(Date.now()), 3, new Set(pantry));
    // Leftovers can only come from the previous day's lunch.
    const source = meal === 'dinner' ? leftoverSource(week!.days[dayIndex - 1]?.lunch) : null;
    const current = week!.days[dayIndex].dinner;
    const alreadyLeftovers = meal === 'dinner' && current.kind === 'leftovers';
    setSwap({ dayIndex, meal, options, leftover: source && !alreadyLeftovers ? (getRecipe(source) ?? null) : null });
  }

  async function choose(recipeId: string, kind: 'recipe' | 'leftovers' = 'recipe') {
    if (!swap) return;
    // Choosing keeps the old lock state off: a swapped meal is a fresh choice.
    await setSlot(swap.dayIndex, swap.meal, { kind, recipeId, locked: false });
    setSwap(null);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.label}>{t('menu.dinnerStyle')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {DINNER_STYLES.map((style) => {
          const selected = week.dinnerStyle === style;
          return (
            <Pressable
              key={style}
              onPress={() => newWeek(style)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{t(`dinnerStyle.${style}`)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable onPress={() => router.push('/pantry')} accessibilityRole="button">
        <Card>
          <Text style={styles.pantryTitle}>{t('pantry.title')}</Text>
          <Text style={styles.label}>{pantry.length > 0 ? t('pantry.summary', { n: pantry.length }) : t('pantry.empty')}</Text>
        </Card>
      </Pressable>

      {week.days.map((day, dayIndex) => (
        <Card key={dayIndex}>
          <Text style={[styles.day, dayIndex === today && styles.today]}>
            {t(`day.${dayIndex}` as 'day.0')}
            {dayIndex === today ? ` · ${t('day.today')}` : ''}
          </Text>
          {MEALS.map((meal) => (
            <MealRow
              key={meal}
              meal={meal}
              slot={day[meal]}
              cookExtra={meal === 'lunch' && cooksForTomorrow(week, dayIndex)}
              onSwap={() => openSwap(dayIndex, meal)}
              onToggleLock={() => toggleLock(dayIndex, meal)}
            />
          ))}
        </Card>
      ))}

      <View style={styles.footer}>
        <Button label={t('menu.newWeek')} onPress={() => newWeek()} />
      </View>
      <BodyText muted>{t('menu.newWeek.hint')}</BodyText>

      <Modal visible={swap !== null} transparent animationType="slide" onRequestClose={() => setSwap(null)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('menu.swap.title')}</Text>
            {swap?.options.length === 0 ? <BodyText muted>{t('menu.swap.none')}</BodyText> : null}
            {swap?.options.map((recipe) => (
              <Choice
                key={recipe.id}
                label={recipe.name[language]}
                hint={t('meal.minutes', { n: totalMinutes(recipe) })}
                selected={false}
                onPress={() => choose(recipe.id)}
              />
            ))}
            {swap?.leftover ? (
              <Choice
                label={`${t('meal.leftovers')}: ${swap.leftover.name[language]}`}
                hint={t('meal.leftovers.hint')}
                selected={false}
                onPress={() => choose(swap.leftover!.id, 'leftovers')}
              />
            ) : null}
            <Button variant="quiet" label={t('menu.swap.cancel')} onPress={() => setSwap(null)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  label: { fontSize: fontSize.small, color: colors.textMuted },
  chips: { gap: spacing.sm },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.small, color: colors.text },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  day: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  today: { color: colors.primary },
  footer: { flexDirection: 'row' },
  pantryTitle: { fontSize: fontSize.body, fontWeight: '600', color: colors.primary },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: colors.background,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: spacing.sm,
  },
  sheetTitle: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
});
