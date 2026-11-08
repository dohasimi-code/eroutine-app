import { commit, eraseAt, redo, startHistory, strokeHit, strokeToPath, undo, Stroke } from './ink';
import { pageHeight, staffLines } from './staff';

const line: Stroke = { id: 'a', color: '#000', width: 2, points: [0, 0, 100, 0] };

describe('ink', () => {
  it('turns a tap into a dot and a line into a path', () => {
    expect(strokeToPath([5, 5])).toBe('M5 5l0.01 0');
    expect(strokeToPath([0, 0, 10, 10])).toBe('M0 0L10 10');
    expect(strokeToPath([])).toBe('');
  });
  it('hits near the polyline only', () => {
    expect(strokeHit(line, 50, 4, 4)).toBe(true);
    expect(strokeHit(line, 50, 20, 4)).toBe(false);
    expect(strokeHit(line, 150, 0, 4)).toBe(false);
  });
  it('erase keeps identity when nothing is hit', () => {
    const list = [line];
    expect(eraseAt(list, 50, 50, 4)).toBe(list);
    expect(eraseAt(list, 50, 0, 4)).toEqual([]);
  });
  it('undo/redo round-trips', () => {
    let h = startHistory<number[]>([]);
    h = commit(h, [1]);
    h = commit(h, [1, 2]);
    h = undo(h);
    expect(h.present).toEqual([1]);
    h = redo(h);
    expect(h.present).toEqual([1, 2]);
    h = undo(undo(undo(h)));
    expect(h.present).toEqual([]);
    expect(commit(h, h.present)).toBe(h);
  });
});

describe('staff', () => {
  it('has five evenly spaced lines inside the margins', () => {
    const l = staffLines(1, 400);
    expect(l).toHaveLength(5);
    expect(l[1].y - l[0].y).toBe(l[4].y - l[3].y);
    expect(l[0].x1).toBe(20);
    expect(l[0].x2).toBe(380);
    expect(pageHeight(2)).toBeGreaterThan(pageHeight(1));
  });
});
