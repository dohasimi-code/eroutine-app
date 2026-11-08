/** Ink strokes: smoothing to SVG paths and eraser hit-testing. Points are flat [x0,y0,x1,y1,...]. */

export type Stroke = {
  id: string;
  color: string;
  width: number;
  points: number[];
};

let counter = 0;
export function newStrokeId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter}`;
}

const r = (n: number) => Math.round(n * 10) / 10;

/** Quadratic-midpoint smoothing; a single tap becomes a dot. */
export function strokeToPath(points: number[]): string {
  const n = points.length / 2;
  if (n === 0) return '';
  if (n === 1) {
    const [x, y] = points;
    return `M${r(x)} ${r(y)}l0.01 0`;
  }
  let d = `M${r(points[0])} ${r(points[1])}`;
  for (let i = 1; i < n - 1; i++) {
    const cx = points[i * 2];
    const cy = points[i * 2 + 1];
    const mx = (cx + points[(i + 1) * 2]) / 2;
    const my = (cy + points[(i + 1) * 2 + 1]) / 2;
    d += `Q${r(cx)} ${r(cy)} ${r(mx)} ${r(my)}`;
  }
  d += `L${r(points[(n - 1) * 2])} ${r(points[(n - 1) * 2 + 1])}`;
  return d;
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** True if (x, y) is within `radius` of the stroke's polyline. */
export function strokeHit(stroke: Stroke, x: number, y: number, radius: number): boolean {
  const p = stroke.points;
  const reach = radius + stroke.width / 2;
  if (p.length === 2) return Math.hypot(x - p[0], y - p[1]) <= reach;
  for (let i = 0; i + 3 < p.length; i += 2) {
    if (distToSegment(x, y, p[i], p[i + 1], p[i + 2], p[i + 3]) <= reach) return true;
  }
  return false;
}

/** Strokes remaining after erasing at (x, y). Returns the same array if nothing was hit. */
export function eraseAt(strokes: Stroke[], x: number, y: number, radius: number): Stroke[] {
  const kept = strokes.filter((s) => !strokeHit(s, x, y, radius));
  return kept.length === strokes.length ? strokes : kept;
}

/** Undo/redo history over immutable snapshots. */
export type History<T> = { past: T[]; present: T; future: T[] };

export const startHistory = <T,>(present: T): History<T> => ({ past: [], present, future: [] });
export const commit = <T,>(h: History<T>, next: T): History<T> =>
  next === h.present ? h : { past: [...h.past, h.present], present: next, future: [] };
export const undo = <T,>(h: History<T>): History<T> =>
  h.past.length === 0
    ? h
    : { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] };
export const redo = <T,>(h: History<T>): History<T> =>
  h.future.length === 0
    ? h
    : { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) };
