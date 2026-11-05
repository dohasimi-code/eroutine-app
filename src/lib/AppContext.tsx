import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { makeId, makeJoinCode } from './logic';
import { localRepository, type Repository } from './repository';
import type { Photo, RevealMode, WeddingEvent } from './types';

type NewEvent = { title: string; date: string; shotsPerGuest: number; reveal: RevealMode };

type Ctx = {
  ready: boolean;
  events: WeddingEvent[];
  photos: Photo[];
  createEvent: (e: NewEvent) => Promise<WeddingEvent>;
  deleteEvent: (id: string) => Promise<void>;
  addPhoto: (eventId: string, tempUri: string, guest: string) => Promise<Photo>;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children, repo = localRepository }: { children: ReactNode; repo?: Repository }) {
  const [ready, setReady] = useState(false);
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    repo.load().then((d) => {
      setEvents(d.events);
      setPhotos(d.photos);
      setReady(true);
    });
  }, [repo]);

  const createEvent = useCallback(
    async (e: NewEvent) => {
      const ev: WeddingEvent = { ...e, id: makeId(), joinCode: makeJoinCode(), createdAt: Date.now() };
      const next = [ev, ...events];
      setEvents(next);
      await repo.saveEvents(next);
      return ev;
    },
    [events, repo],
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      const gone = photos.filter((p) => p.eventId === id);
      const nextEvents = events.filter((e) => e.id !== id);
      const nextPhotos = photos.filter((p) => p.eventId !== id);
      setEvents(nextEvents);
      setPhotos(nextPhotos);
      await Promise.all(gone.map((p) => repo.removePhotoFile(p.uri)));
      await Promise.all([repo.saveEvents(nextEvents), repo.savePhotos(nextPhotos)]);
    },
    [events, photos, repo],
  );

  const addPhoto = useCallback(
    async (eventId: string, tempUri: string, guest: string) => {
      const id = makeId();
      const uri = await repo.persistPhoto(tempUri, id);
      const photo: Photo = { id, eventId, uri, takenAt: Date.now(), guest };
      const next = [photo, ...photos];
      setPhotos(next);
      await repo.savePhotos(next);
      return photo;
    },
    [photos, repo],
  );

  const value = useMemo(
    () => ({ ready, events, photos, createEvent, deleteEvent, addPhoto }),
    [ready, events, photos, createEvent, deleteEvent, addPhoto],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp must be used inside AppProvider');
  return c;
}
