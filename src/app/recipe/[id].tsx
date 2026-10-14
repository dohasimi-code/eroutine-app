import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { INGREDIENTS, type IngredientId } from '../../data/ingredients';
import { useApp } from '../../lib/AppContext';
import { MEALS, getRecipe, recipeTags, type Meal } from '../../lib/menu';
import { formatQuantity, scaleQuantity } from '../../lib/quantity';
import { Button } from '../../ui/Choice';
import { BodyText, Card, Screen } from '../../ui/Screen';
import { colors, fontSize, spacing } from '../../ui/theme';

export default function RecipeScreen() {
  // Opened from a planned meal, the recipe can be ticked off right here after cooking.
  const { id, day, meal } = useLocalSearchParams<{ id: string; day?: string; meal?: string }>();
  const { t, language, profile, week, markDone } = useApp();
  const recipe = getRecipe(id);
  const dayIndex = Number(day);
  const plannedMeal = MEALS.find((m) => m === meal) as Meal | undefined;
  const slot = plannedMeal && week?.days[dayIndex]?.[plannedMeal];
  const canMarkDone = slot && slot.kind !== 'empty' && slot.recipeId === id && !slot.done;

  if (!recipe) {
    return (
      <Screen title={t('recipe.notFound')}>
        <Stack.Screen options={{ title: '' }} />
      </Screen>
    );
  }

  const people = profile?.people ?? recipe.servings;
  const tags = recipeTags(recipe);

  return (
    <Screen title={recipe.name[language]} subtitle={t('recipe.servings', { n: people })}>
      <Stack.Screen options={{ title: '' }} />

      <View style={styles.times}>
        <Time label={t('recipe.prep')} value={t('meal.minutes', { n: recipe.prepMinutes })} />
        <Time label={t('recipe.cook')} value={t('meal.minutes', { n: recipe.cookMinutes })} />
        {recipe.soakHours ? <Time label={t('recipe.soak')} value={t('recipe.hours', { n: recipe.soakHours })} /> : null}
      </View>

      <Card>
        <Text style={styles.heading}>{t('recipe.ingredients')}</Text>
        {recipe.ingredients.map((item) => {
          const info = INGREDIENTS[item.id as IngredientId];
          const amount = formatQuantity(scaleQuantity(item.qty, item.unit, recipe.servings, people), item.unit, language);
          const notes = [item.optional && t('recipe.optional'), 'checkLabel' in info && info.checkLabel && t('recipe.checkLabel')].filter(Boolean);
          return (
            <View key={item.id} style={styles.ingredient}>
              <Text style={styles.amount}>{amount}</Text>
              <Text style={styles.ingredientName}>
                {info.name[language]}
                {notes.length ? <Text style={styles.note}>{` (${notes.join(', ')})`}</Text> : null}
              </Text>
            </View>
          );
        })}
        <BodyText muted>
          {tags.length
            ? t('recipe.contains', { list: tags.map((tag) => t(`tag.${tag}`)).join(', ') })
            : t('recipe.containsNone')}
        </BodyText>
      </Card>

      <Card>
        <Text style={styles.heading}>{t('recipe.steps')}</Text>
        {recipe.steps[language].map((step, index) => (
          <View key={index} style={styles.step}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </Card>

      {recipe.leftoverTip ? (
        <Card>
          <Text style={styles.heading}>{t('recipe.leftovers')}</Text>
          <BodyText>{recipe.leftoverTip[language]}</BodyText>
        </Card>
      ) : null}

      {canMarkDone ? (
        <Button
          label={t('meal.markDone')}
          onPress={async () => {
            await markDone(dayIndex, plannedMeal!, true);
            router.back();
          }}
        />
      ) : null}

      <BodyText muted>{t('recipe.draft')}</BodyText>
      <BodyText muted>{t('settings.disclaimer')}</BodyText>
    </Screen>
  );
}

function Time({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.time}>
      <Text style={styles.timeLabel}>{label}</Text>
      <Text style={styles.timeValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  time: {
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
  },
  timeLabel: { fontSize: fontSize.small - 2, color: colors.textMuted },
  timeValue: { fontSize: fontSize.body, color: colors.text, fontWeight: '600' },
  heading: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  ingredient: { flexDirection: 'row', gap: spacing.sm },
  amount: { width: 110, fontSize: fontSize.body, color: colors.text, fontWeight: '600' },
  ingredientName: { flex: 1, fontSize: fontSize.body, color: colors.text },
  note: { fontSize: fontSize.small, color: colors.textMuted },
  step: { flexDirection: 'row', gap: spacing.sm },
  stepNumber: { width: 24, fontSize: fontSize.body, color: colors.primary, fontWeight: '700' },
  stepText: { flex: 1, fontSize: fontSize.body, color: colors.text, lineHeight: 24 },
});
