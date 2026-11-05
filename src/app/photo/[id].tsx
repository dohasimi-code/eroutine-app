import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../lib/AppContext';
import { s } from '../../lib/strings';

export default function PhotoViewer() {
  const { id, index } = useLocalSearchParams<{ id: string; index?: string }>();
  const { photos } = useApp();
  const { width, height } = useWindowDimensions();
  const list = photos.filter((p) => p.eventId === id);
  const start = Math.min(Math.max(Number(index) || 0, 0), Math.max(list.length - 1, 0));

  return (
    <View style={styles.root}>
      <FlatList
        data={list}
        horizontal
        pagingEnabled
        initialScrollIndex={list.length ? start : undefined}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        keyExtractor={(p) => p.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width, height, justifyContent: 'center' }}>
            <Image source={{ uri: item.uri }} style={{ width, height: height * 0.8 }} contentFit="contain" />
            <Text style={styles.by}>{item.guest}</Text>
          </View>
        )}
      />
      <SafeAreaView style={styles.close} pointerEvents="box-none">
        <Pressable accessibilityRole="button" accessibilityLabel={s.back} onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  close: { position: 'absolute', top: 0, right: 0, padding: 16 },
  closeText: { color: '#fff', fontSize: 28, padding: 8 },
  by: { color: '#fff', textAlign: 'center', marginTop: 8, opacity: 0.8 },
});
