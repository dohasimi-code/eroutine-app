import React, { useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, PanResponder, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';
import { eraseAt, newStrokeId, Stroke, strokeToPath } from '../lib/ink';
import { pageHeight, staffLines } from '../lib/staff';

export type Tool = 'pen' | 'eraser' | 'hand';

type Props = {
  width: number;
  systems: number;
  strokes: Stroke[];
  tool: Tool;
  color: string;
  /** Called once per finished gesture with the new stroke list. */
  onChange: (next: Stroke[]) => void;
  onDrawingChange?: (drawing: boolean) => void;
};

const PEN_WIDTH = 2.2;
const ERASER_RADIUS = 10;

export function StaffCanvas({ width, systems, strokes, tool, color, onChange, onDrawingChange }: Props) {
  const [live, setLive] = useState<Stroke | null>(null);
  const [erased, setErased] = useState<Stroke[] | null>(null);

  // PanResponder is created once; read current props through a ref.
  const latest = useRef({ strokes, tool, color, onChange, onDrawingChange });
  latest.current = { strokes, tool, color, onChange, onDrawingChange };
  const liveRef = useRef<Stroke | null>(null);
  const erasedRef = useRef<Stroke[] | null>(null);

  const responder = useMemo(() => {
    const pos = (e: GestureResponderEvent) => [e.nativeEvent.locationX, e.nativeEvent.locationY] as const;

    const begin = (e: GestureResponderEvent) => {
      const { tool: t, color: c, strokes: s, onDrawingChange: od } = latest.current;
      const [x, y] = pos(e);
      od?.(true);
      if (t === 'pen') {
        liveRef.current = { id: newStrokeId(), color: c, width: PEN_WIDTH, points: [x, y] };
        setLive(liveRef.current);
      } else if (t === 'eraser') {
        erasedRef.current = eraseAt(s, x, y, ERASER_RADIUS);
        setErased(erasedRef.current);
      }
    };

    const move = (e: GestureResponderEvent) => {
      const [x, y] = pos(e);
      if (liveRef.current) {
        const cur = liveRef.current;
        const n = cur.points.length;
        // Skip sub-pixel jitter to keep paths small.
        if (Math.hypot(x - cur.points[n - 2], y - cur.points[n - 1]) < 1.2) return;
        liveRef.current = { ...cur, points: [...cur.points, x, y] };
        setLive(liveRef.current);
      } else if (erasedRef.current) {
        const next = eraseAt(erasedRef.current, x, y, ERASER_RADIUS);
        if (next !== erasedRef.current) {
          erasedRef.current = next;
          setErased(next);
        }
      }
    };

    const end = () => {
      const { strokes: s, onChange: oc, onDrawingChange: od } = latest.current;
      if (liveRef.current) oc([...s, liveRef.current]);
      else if (erasedRef.current && erasedRef.current !== s) oc(erasedRef.current);
      liveRef.current = null;
      erasedRef.current = null;
      setLive(null);
      setErased(null);
      od?.(false);
    };

    return PanResponder.create({
      onStartShouldSetPanResponder: () => latest.current.tool !== 'hand',
      onMoveShouldSetPanResponder: () => latest.current.tool !== 'hand',
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: begin,
      onPanResponderMove: move,
      onPanResponderRelease: end,
      onPanResponderTerminate: end,
    });
  }, []);

  const shown = erased ?? strokes;
  const height = pageHeight(systems);

  return (
    <View
      {...responder.panHandlers}
      style={{ width, height, backgroundColor: '#FFFEFA' }}
      accessibilityLabel="Faqja e portativeve"
    >
      <Svg width={width} height={height} pointerEvents="none">
        {Array.from({ length: systems }, (_, i) =>
          staffLines(i, width).map((l, j) => (
            <Line key={`${i}-${j}`} x1={l.x1} x2={l.x2} y1={l.y} y2={l.y} stroke="#B9B3A6" strokeWidth={1} />
          )),
        )}
        {shown.map((s) => (
          <Path key={s.id} d={strokeToPath(s.points)} stroke={s.color} strokeWidth={s.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {live && (
          <Path d={strokeToPath(live.points)} stroke={live.color} strokeWidth={live.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </Svg>
    </View>
  );
}
