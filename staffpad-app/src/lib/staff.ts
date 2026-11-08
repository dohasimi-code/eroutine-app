/** Geometry of the manuscript page: a stack of five-line staves ("systems"). */

export const LINE_GAP = 14; // distance between staff lines
export const SYSTEM_HEIGHT = LINE_GAP * 10; // 4 gaps of staff + room above/below for notes
export const STAFF_TOP_OFFSET = LINE_GAP * 3; // free space above the first line
export const SIDE_MARGIN = 20;

export type StaffLine = { y: number; x1: number; x2: number };

export function systemTop(index: number): number {
  return index * SYSTEM_HEIGHT;
}

/** The five line positions of system `index` for a page `width` wide. */
export function staffLines(index: number, width: number): StaffLine[] {
  const first = systemTop(index) + STAFF_TOP_OFFSET;
  return Array.from({ length: 5 }, (_, i) => ({
    y: first + i * LINE_GAP,
    x1: SIDE_MARGIN,
    x2: Math.max(SIDE_MARGIN, width - SIDE_MARGIN),
  }));
}

export function pageHeight(systems: number): number {
  return systems * SYSTEM_HEIGHT + LINE_GAP * 2;
}
