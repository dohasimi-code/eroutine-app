import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../lib/AppContext';
import { daysUntil } from '../lib/logic';
import { s } from '../lib/strings';
import { Button, Card } from '../ui/components';
import { colors, space } from '../ui/theme';

export default function Home() {
  const { events, photos, ready } = useApp();
  if (!ready) return null;

  return (
    <View style={styles.root}>
      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.tagline}>{s.tagline}</Text>}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{s.empty}</Text>
            <Text style={styles.muted}>{s.emptyHint}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const d = daysUntil(item.date);
          const count = photos.filter((p) => p.eventId === item.id).length;
          return (
            <Pressable accessibilityRole="button" onPress={() => router.push(`/event/${item.id}`)}>
              <Card style={styles.card}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.muted}>
                  {item.date} · {d === 0 ? s.today : d > 0 ? s.inDays(d) : s.past}
                </Text>
                <Text style={styles.count}>{s.photosCount(count)}</Text>
              </Card>
            </Pressable>
          );
        }}
      />
      <View style={styles.footer}>
        <Button label={s.create} onPress={() => router.push('/new-event')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { padding: space.md, gap: space.md, flexGrow: 1 },
  tagline: { color: colors.muted, fontSize: 16, lineHeight: 22, marginBottom: space.sm },
  empty: { alignItems: 'center', gap: space.sm, paddingTop: 80 },
  emptyTitle: { fontSize: 22, fontWeight: '600', color: colors.text },
  muted: { color: colors.muted, textAlign: 'center' },
  card: { gap: space.xs },
  title: { fontSize: 20, fontWeight: '600', color: colors.text },
  count: { color: colors.accentDark, fontWeight: '600', marginTop: space.xs },
  footer: { padding: space.md },
});
