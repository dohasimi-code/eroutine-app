import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../lib/AppContext';
import { getRecipe, totalMinutes, type Meal, type Slot } from '../lib/menu';
import { colors, fontSize, spacing } from './theme';

type Props = {
  meal: Meal;
  slot: Slot;
  // This lunch is also tomorrow's dinner.
  cookExtra?: boolean;
  onSwap?(): void;
  onToggleLock?(): void;
};

export function MealRow({ meal, slot, cookExtra, onSwap, onToggleLock }: Props) {
  const { t, language } = useApp();
  const recipe = slot.kind === 'empty' ? undefined : getRecipe(slot.recipeId);

  let title: string;
  let detail: string | null = null;
  if (recipe && slot.kind === 'leftovers') {
    title = recipe.name[language];
    detail = `${t('meal.leftovers')} · ${t('meal.leftovers.hint')}`;
  } else if (recipe) {
    title = recipe.name[language];
    detail = t('meal.minutes', { n: totalMinutes(recipe) });
    if (recipe.soakHours) detail += ` ${t('meal.soak', { n: recipe.soakHours })}`;
    if (cookExtra) detail += ` · ${t('meal.cookExtra')}`;
  } else {
    title = t('meal.empty');
  }

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.main}
        disabled={!recipe}
        onPress={() => recipe && router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
        accessibilityRole={recipe ? 'button' : undefined}
      >
        <Text style={styles.meal}>{t(`meal.${meal}`)}</Text>
        <Text style={styles.title}>{title}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </Pressable>
      {onToggleLock && slot.kind !== 'empty' ? (
        <Pressable
          onPress={onToggleLock}
          accessibilityRole="button"
          accessibilityLabel={slot.locked ? t('menu.unlock') : t('menu.lock')}
          accessibilityState={{ selected: slot.locked }}
          hitSlop={8}
          style={styles.icon}
        >
          <Ionicons name={slot.locked ? 'lock-closed' : 'lock-open-outline'} size={22} color={slot.locked ? colors.primary : colors.textMuted} />
        </Pressable>
      ) : null}
      {onSwap ? (
        <Pressable onPress={onSwap} accessibilityRole="button" accessibilityLabel={t('menu.swap')} hitSlop={8} style={styles.icon}>
          <Ionicons name="swap-horizontal" size={22} color={colors.text} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs },
  main: { flex: 1, gap: 2 },
  meal: { fontSize: fontSize.small - 2, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: fontSize.body, color: colors.text, fontWeight: '500' },
  detail: { fontSize: fontSize.small, color: colors.textMuted },
  icon: { padding: spacing.sm },
});
