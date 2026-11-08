import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commit, History, redo, startHistory, Stroke, undo } from '../lib/ink';
import { loadScore, saveScore } from '../lib/storage';
import { StaffCanvas, Tool } from '../ui/StaffCanvas';

const COLORS = ['#1B1B1B', '#1F5FBF', '#C0392B'];
const MAX_SYSTEMS = 40;

export default function Editor() {
  const { width } = useWindowDimensions();
  const [hist, setHist] = useState<History<Stroke[]>>(startHistory<Stroke[]>([]));
  const [systems, setSystems] = useState(4);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(COLORS[0]);
  const [drawing, setDrawing] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    loadScore().then((s) => {
      if (s) {
        setSystems(Math.min(MAX_SYSTEMS, Math.max(1, s.systems)));
        setHist(startHistory(s.strokes));
      }
      loaded.current = true;
    });
  }, []);

  // Debounced autosave; skipped until the stored score has been read.
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => saveScore({ systems, strokes: hist.present }), 400);
    return () => clearTimeout(t);
  }, [hist.present, systems]);

  const onChange = useCallback((next: Stroke[]) => setHist((h) => commit(h, next)), []);
  const canUndo = hist.past.length > 0;
  const canRedo = hist.future.length > 0;

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <View style={s.bar}>
        <Btn label="Laps" on={tool === 'pen'} onPress={() => setTool('pen')} />
        <Btn label="Gomë" on={tool === 'eraser'} onPress={() => setTool('eraser')} />
        <Btn label="Lëviz" on={tool === 'hand'} onPress={() => setTool('hand')} />
        <View style={s.sep} />
        {COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => {
              setColor(c);
              setTool('pen');
            }}
            accessibilityLabel={`Ngjyra ${c}`}
            style={[s.dot, { backgroundColor: c }, color === c && tool === 'pen' && s.dotOn]}
          />
        ))}
        <View style={s.sep} />
        <Btn label="Zhbëj" disabled={!canUndo} onPress={() => setHist(undo)} />
        <Btn label="Ribëj" disabled={!canRedo} onPress={() => setHist(redo)} />
        <Btn label="+ Rresht" disabled={systems >= MAX_SYSTEMS} onPress={() => setSystems((n) => n + 1)} />
        <Btn label="Pastro" disabled={hist.present.length === 0} onPress={() => onChange([])} />
      </View>
      <ScrollView scrollEnabled={tool === 'hand' && !drawing} contentContainerStyle={s.page}>
        <StaffCanvas
          width={width}
          systems={systems}
          strokes={hist.present}
          tool={tool}
          color={color}
          onChange={onChange}
          onDrawingChange={setDrawing}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Btn({ label, on, disabled, onPress }: { label: string; on?: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={[s.btn, on && s.btnOn, disabled && s.btnOff]}
    >
      <Text style={[s.btnText, on && s.btnTextOn]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ECE8DF' },
  bar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, padding: 8, backgroundColor: '#FFFEFA', borderBottomWidth: 1, borderBottomColor: '#D8D2C4' },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F1EDE3' },
  btnOn: { backgroundColor: '#1B1B1B' },
  btnOff: { opacity: 0.35 },
  btnText: { fontSize: 14, color: '#1B1B1B' },
  btnTextOn: { color: '#FFFEFA' },
  sep: { width: 1, height: 22, backgroundColor: '#D8D2C4', marginHorizontal: 2 },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  dotOn: { borderColor: '#B9B3A6' },
  page: { flexGrow: 1 },
});
