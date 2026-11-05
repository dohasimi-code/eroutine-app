/** Domeni ku hapet ftesa e të ftuarve. Ndrysho kur të kesh domenin real. */
export const JOIN_BASE_URL = 'https://vowsnap.app/j';

export const SHOT_OPTIONS = [12, 24, 36] as const;

export const joinUrl = (code: string) => `${JOIN_BASE_URL}/${code}`;
