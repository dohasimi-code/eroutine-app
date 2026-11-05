import { daysUntil, isRevealed, isValidDate, makeJoinCode, shotsLeft } from '../logic';
import type { Photo, WeddingEvent } from '../types';

const ev: WeddingEvent = {
  id: 'e1', title: 'A & B', date: '2027-06-12', shotsPerGuest: 3, reveal: 'after', joinCode: 'ABC234', createdAt: 0,
};
const photo = (guest: string, eventId = 'e1'): Photo => ({ id: Math.random().toString(), eventId, uri: 'x', takenAt: 0, guest });

test('shotsLeft counts per guest and per event, never below 0', () => {
  const photos = [photo('Ana'), photo('Ana'), photo('Ana'), photo('Ana'), photo('Bes'), photo('Ana', 'other')];
  expect(shotsLeft(ev, photos, 'Ana')).toBe(0);
  expect(shotsLeft(ev, photos, 'Bes')).toBe(2);
  expect(shotsLeft(ev, [], 'Ri')).toBe(3);
});

test('isRevealed: after-mode hides until the day ends', () => {
  expect(isRevealed(ev, new Date('2027-06-12T20:00:00'))).toBe(false);
  expect(isRevealed(ev, new Date('2027-06-13T00:00:01'))).toBe(true);
  expect(isRevealed({ ...ev, reveal: 'instant' }, new Date('2020-01-01'))).toBe(true);
});

test('isValidDate rejects bad and impossible dates', () => {
  expect(isValidDate('2027-06-12')).toBe(true);
  expect(isValidDate('2027-02-30')).toBe(false);
  expect(isValidDate('12-06-2027')).toBe(false);
});

test('makeJoinCode has right length and no ambiguous chars', () => {
  for (let i = 0; i < 50; i++) expect(makeJoinCode()).toMatch(/^[A-HJKMN-Z2-9]{6}$/);
});

test('daysUntil', () => {
  expect(daysUntil('2027-06-12', new Date('2027-06-10T15:00:00'))).toBe(2);
  expect(daysUntil('2027-06-12', new Date('2027-06-12T01:00:00'))).toBe(0);
});
