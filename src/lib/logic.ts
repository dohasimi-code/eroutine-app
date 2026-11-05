import type { Photo, WeddingEvent } from './types';

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function makeJoinCode(len = 6, rand: () => number = Math.random): string {
  let out = '';
  for (let i = 0; i < len; i++) out += CODE_CHARS[Math.floor(rand() * CODE_CHARS.length)];
  return out;
}

export function makeId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Sa foto i kanë mbetur këtij të ftuari. */
export function shotsLeft(event: WeddingEvent, photos: Photo[], guest: string): number {
  const used = photos.filter((p) => p.eventId === event.id && p.guest === guest).length;
  return Math.max(0, event.shotsPerGuest - used);
}

/** Në modalitetin "after", fotot hapen vetëm pas ditës së dasmës. */
export function isRevealed(event: WeddingEvent, now: Date = new Date()): boolean {
  if (event.reveal === 'instant') return true;
  const end = new Date(`${event.date}T23:59:59`);
  return now.getTime() > end.getTime();
}

export function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function daysUntil(dateIso: string, now: Date = new Date()): number {
  const target = new Date(`${dateIso}T00:00:00`);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}
