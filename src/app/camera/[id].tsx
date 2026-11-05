import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../lib/AppContext';
import { shotsLeft } from '../../lib/logic';
import { s } from '../../lib/strings';
import { Button } from '../../ui/components';
import { colors, radius, space } from '../../ui/theme';

export default function CameraScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { events, photos, addPhoto } = useApp();
  const [perm, requestPerm] = useCameraPermissions();
  const [guest, setGuest] = useState('');
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const cam = useRef<CameraView>(null);

  const event = events.find((e) => e.id === id);
  if (!event) return null;

  const left = shotsLeft(event, photos, guest.trim());

  async function shoot() {
    if (busy || left === 0 || !cam.current) return;
    setBusy(true);
    try {
      const pic = await cam.current.takePictureAsync({ quality: 0.8 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      await addPhoto(event!.id, pic.uri, guest.trim());
    } finally {
      setBusy(false);
    }
  }

  if (!started) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.h1}>{event.title}</Text>
        <Text style={styles.muted}>{s.yourName}</Text>
        <TextInput
          style={styles.input}
          value={guest}
          onChangeText={setGuest}
          placeholder={s.yourNamePh}
          placeholderTextColor={colors.muted}
          autoFocus
        />
        <Button label={s.start} disabled={!guest.trim()} onPress={() => setStarted(true)} />
        <Button label={s.back} variant="ghost" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (!perm) return null;
  if (!perm.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.muted}>{s.camPerm}</Text>
        <Button label={s.allow} onPress={requestPerm} />
        <Button label={s.back} variant="ghost" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.cam}>
      <CameraView ref={cam} style={StyleSheet.absoluteFill} facing="back" />
      <SafeAreaView style={styles.overlay}>
        <Text style={styles.counter}>{left > 0 ? s.shotsLeft(left) : s.noShots}</Text>
        <View style={styles.bar}>
          <Pressable accessibilityRole="button" accessibilityLabel={s.back} onPress={() => router.back()} style={styles.side}>
            <Text style={styles.sideText}>{s.back}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bëj foto"
            disabled={busy || left === 0}
            onPress={shoot}
            style={[styles.shutter, (busy || left === 0) && { opacity: 0.4 }]}
          />
          <View style={styles.side} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.bg, padding: space.lg, gap: space.md, justifyContent: 'center' },
  h1: { fontSize: 28, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 16 },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    fontSize: 16,
    color: colors.text,
  },
  cam: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  counter: {
    alignSelf: 'center',
    color: '#fff',
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.lg,
    marginTop: space.md,
    overflow: 'hidden',
  },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg },
  side: { width: 80 },
  sideText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  shutter: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#fff', borderWidth: 6, borderColor: 'rgba(255,255,255,0.5)' },
});
