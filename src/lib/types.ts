export type RevealMode = 'instant' | 'after';

export type WeddingEvent = {
  id: string;
  /** Emri i çiftit, p.sh. "Era & Dritan" */
  title: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  shotsPerGuest: number;
  /** instant: fotot duken menjëherë; after: fshihen deri pas datës së dasmës */
  reveal: RevealMode;
  joinCode: string;
  createdAt: number;
};

export type Photo = {
  id: string;
  eventId: string;
  uri: string;
  takenAt: number;
  guest: string;
};
