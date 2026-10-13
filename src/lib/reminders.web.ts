import type { Language } from '../i18n';
import type { Routine } from './routines';

// Browser preview only: browsers cannot schedule the phone's local reminders,
// so routines are saved but no reminder is sent.
export async function requestReminderPermission(_channelName: string): Promise<boolean> {
  return false;
}

export async function syncReminders(_routines: Routine[], _language: Language, _channelName: string): Promise<void> {}

export async function cancelAllReminders(): Promise<void> {}
