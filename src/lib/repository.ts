import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import type { Photo, WeddingEvent } from './types';

/**
 * Kufiri me backend-in. Sot ruan vetëm në telefon; për albumin e përbashkët
 * real (të ftuarit nga telefona të ndryshëm) zëvendësohet me një implementim
 * Supabase/Firebase pa prekur ekranet.
 */
export interface Repository {
  load(): Promise<{ events: WeddingEvent[]; photos: Photo[] }>;
  saveEvents(events: WeddingEvent[]): Promise<void>;
  savePhotos(photos: Photo[]): Promise<void>;
  /** Kopjon foton në ruajtje të përhershme dhe kthen URI-n e re. */
  persistPhoto(tempUri: string, id: string): Promise<string>;
  removePhotoFile(uri: string): Promise<void>;
}

const EVENTS_KEY = 'vowsnap.events.v1';
const PHOTOS_KEY = 'vowsnap.photos.v1';

async function readJson<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export const localRepository: Repository = {
  async load() {
    const [events, photos] = await Promise.all([
      readJson<WeddingEvent>(EVENTS_KEY),
      readJson<Photo>(PHOTOS_KEY),
    ]);
    return { events, photos };
  },
  async saveEvents(events) {
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  },
  async savePhotos(photos) {
    await AsyncStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
  },
  async persistPhoto(tempUri, id) {
    // Në web URI është blob/data; nuk ka sistem skedarësh të përhershëm.
    if (Platform.OS === 'web') return tempUri;
    const dir = new Directory(Paths.document, 'photos');
    if (!dir.exists) dir.create({ intermediates: true });
    const dest = new File(dir, `${id}.jpg`);
    new File(tempUri).copy(dest);
    return dest.uri;
  },
  async removePhotoFile(uri) {
    if (Platform.OS === 'web') return;
    try {
      const f = new File(uri);
      if (f.exists) f.delete();
    } catch {
      // skedari mund të mungojë tashmë
    }
  },
};
