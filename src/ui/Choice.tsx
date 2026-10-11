import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize, spacing } from './theme';

type ChoiceProps = {
  label: string;
  hint?: string;
  selected: boolean;
  onPress(): void;
  multiple?: boolean;
};

export function Choice({ label, hint, selected, onPress, multiple }: ChoiceProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multiple ? 'checkbox' : 'radio'}
      accessibilityState={multiple ? { checked: selected } : { selected }}
      style={[styles.choice, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {hint ? <Text style={[styles.hint, selected && styles.labelSelected]}>{hint}</Text> : null}
    </Pressable>
  );
}

type ButtonProps = { label: string; onPress(): void; variant?: 'primary' | 'quiet' };

export function Button({ label, onPress, variant = 'primary' }: ButtonProps) {
  const quiet = variant === 'quiet';
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.button, quiet && styles.buttonQuiet]}>
      <Text style={[styles.buttonText, quiet && styles.buttonTextQuiet]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  choice: {
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontSize: fontSize.body, color: colors.text, fontWeight: '500' },
  labelSelected: { color: '#FFFFFF' },
  hint: { fontSize: fontSize.small, color: colors.textMuted, marginTop: 2 },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  buttonQuiet: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  buttonText: { fontSize: fontSize.body, color: '#FFFFFF', fontWeight: '600' },
  buttonTextQuiet: { color: colors.text },
});
