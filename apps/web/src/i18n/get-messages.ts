import type { Locale } from '@/lib/env';
import en from './messages/en.json';
import fa from './messages/fa.json';

const messages = { en, fa } as const;

export function getMessages(locale: Locale) {
  return messages[locale] ?? messages.en;
}

export type Messages = typeof en;
