import { getLocales } from 'expo-localization';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { PLAN } from '../../data/plan';
import { useApp } from '../../lib/AppContext';
import { canShowKjv, formatReference, kjvVerses } from '../../lib/moment';
import { BodyText, Card, Screen } from '../../ui/Screen';
import { colors, fontSize, spacing } from '../../ui/theme';

export default function ReadingScreen() {
  const { day } = useLocalSearchParams<{ day: string }>();
  const { t, language } = useApp();
  const planDay = PLAN[Number(day)];
  const verses = planDay && canShowKjv(language, getLocales()[0]?.regionCode) ? kjvVerses(planDay.passage) : undefined;

  if (!planDay || !verses) {
    return (
      <Screen title={planDay ? formatReference(planDay.passage, language) : ''}>
        <BodyText muted>{t('reading.unavailable')}</BodyText>
      </Screen>
    );
  }

  const { from } = planDay.passage;
  return (
    <Screen title={formatReference(planDay.passage, language)}>
      <Card>
        {verses.map((verse, index) => (
          <View key={index} style={styles.verse}>
            <Text style={styles.number}>{from + index}</Text>
            <Text style={styles.text}>{verse}</Text>
          </View>
        ))}
      </Card>
      <BodyText muted>{t('reading.source')}</BodyText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  verse: { flexDirection: 'row', gap: spacing.sm },
  number: { width: 24, fontSize: fontSize.small, color: colors.primary, fontWeight: '700', paddingTop: 3 },
  text: { flex: 1, fontSize: fontSize.body, color: colors.text, lineHeight: 26 },
});
