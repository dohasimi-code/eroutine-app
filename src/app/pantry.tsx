import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { INGREDIENTS, type IngredientId } from '../data/ingredients';
import { useApp } from '../lib/AppContext';
import { PANTRY_OPTIONS } from '../lib/pantry';
import { CATEGORY_ORDER } from '../lib/shopping';
import { Button } from '../ui/Choice';
import { BodyText, Card, Screen } from '../ui/Screen';
import { colors, fontSize, spacing } from '../ui/theme';

export default function PantryScreen() {
  const { t, language, pantry, setPantry, newWeek } = useApp();
  const have = new Set(pantry);

  // Saved on every tap, so "new week" below always sees the latest choice.
  const toggle = (id: IngredientId) => setPantry(have.has(id) ? pantry.filter((p) => p !== id) : [...pantry, id]);

  return (
    <Screen title={t('pantry.title')} subtitle={t('pantry.subtitle')}>
      {CATEGORY_ORDER.map((category) => {
        const options = PANTRY_OPTIONS.filter((id) => INGREDIENTS[id].category === category);
        if (options.length === 0) return null;
        return (
          <Card key={category}>
            <Text style={styles.heading}>{t(`list.category.${category}`)}</Text>
            <View style={styles.chips}>
              {options.map((id) => {
                const selected = have.has(id);
                return (
                  <Pressable
                    key={id}
                    onPress={() => toggle(id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{INGREDIENTS[id].name[language]}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        );
      })}
      <View style={styles.buttons}>
        <Button variant="quiet" label={t('pantry.done')} onPress={() => router.back()} />
        <Button
          label={t('pantry.newWeek')}
          onPress={async () => {
            await newWeek();
            router.back();
          }}
        />
      </View>
      <BodyText muted>{t('pantry.hint')}</BodyText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: fontSize.heading, fontWeight: '600', color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.small, color: colors.text },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: spacing.sm },
});
