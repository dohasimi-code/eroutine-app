import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { useApp } from '../../lib/AppContext';
import { joinUrl } from '../../lib/config';
import { isRevealed } from '../../lib/logic';
import { s } from '../../lib/strings';
import { Button, Card } from '../../ui/components';
import { colors, radius, space } from '../../ui/theme';

const COLS = 3;
const GAP = 4;

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, photos, deleteEvent } = useApp();
  const { width } = useWindowDimensions();
  const [copied, setCopied] = useState(false);

  const event = events.find((e) => e.id === id);
  if (!event) return <Stack.Screen options={{ title: '' }} />;

  const url = joinUrl(event.joinCode);
  const mine = photos.filter((p) => p.eventId === event.id);
  const revealed = isRevealed(event);
  const size = (width - space.md * 2 - GAP * (COLS - 1)) / COLS;

  async function copy() {
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function remove() {
    Alert.alert(s.delete, s.deleteConfirm, [
      { text: s.cancel, style: 'cancel' },
      {
        text: s.delete,
        style: 'destructive',
        onPress: async () => {
          await deleteEvent(event!.id);
          router.replace('/');
        },
      },
    ]);
  }

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.muted}>{event.date}</Text>

      <Card style={styles.qrCard}>
        <Text style={styles.qrTitle}>{s.qrTitle}</Text>
        <View style={styles.qrBox}>
          <QRCode value={url} size={180} color={colors.text} backgroundColor="#FFFFFF" />
        </View>
        <Text style={styles.code}>{event.joinCode}</Text>
        <Text style={styles.muted}>{s.qrHint}</Text>
        <View style={styles.row}>
          <Button label={copied ? s.copied : s.copyLink} variant="ghost" onPress={copy} style={{ flex: 1 }} />
          <Button label={s.share} variant="ghost" onPress={() => Share.share({ message: url })} style={{ flex: 1 }} />
        </View>
      </Card>

      <Button label={s.openCamera} onPress={() => router.push(`/camera/${event.id}`)} />
      <Text style={styles.section}>
        {s.album} · {s.photosCount(mine.length)}
      </Text>
      {!revealed && (
        <Card>
          <Text style={styles.qrTitle}>{s.hidden}</Text>
          <Text style={styles.muted}>
            {s.hiddenHint} {event.date}
          </Text>
        </Card>
      )}
      {revealed && mine.length === 0 && <Text style={styles.muted}>{s.noPhotos}</Text>}
    </View>
  );

  return (
    <FlatList
      key={COLS}
      data={revealed ? mine : []}
      numColumns={COLS}
      keyExtractor={(p) => p.id}
      contentContainerStyle={styles.list}
      columnWrapperStyle={{ gap: GAP }}
      ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
      ListHeaderComponent={header}
      ListFooterComponent={<Button label={s.delete} variant="danger" onPress={remove} style={{ marginTop: space.xl }} />}
      renderItem={({ item, index }) => (
        <Pressable
          accessibilityRole="imagebutton"
          onPress={() => router.push({ pathname: '/photo/[id]', params: { id: event.id, index: String(index) } })}
        >
          <Image source={{ uri: item.uri }} style={{ width: size, height: size, borderRadius: 4 }} contentFit="cover" />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: space.md },
  header: { gap: space.md, marginBottom: space.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted },
  qrCard: { alignItems: 'center', gap: space.sm },
  qrTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  qrBox: { padding: space.md, backgroundColor: '#fff', borderRadius: radius.md },
  code: { fontSize: 22, letterSpacing: 4, fontWeight: '700', color: colors.accentDark },
  row: { flexDirection: 'row', gap: space.sm, alignSelf: 'stretch' },
  section: { fontSize: 18, fontWeight: '600', color: colors.text },
});
