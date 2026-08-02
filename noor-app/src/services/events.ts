import { MOCK_EVENTS } from '../data/events';
import type { ReligiousEvent } from '../types/event';

// Signature volontairement asynchrone : quand ce sera branché sur Supabase,
// seul le corps de ces fonctions changera, les écrans qui les appellent
// n'auront rien à modifier.
export async function getEvents(): Promise<ReligiousEvent[]> {
  return MOCK_EVENTS;
}

export async function getEventById(id: string): Promise<ReligiousEvent | undefined> {
  return MOCK_EVENTS.find((event) => event.id === id);
}

export async function getEventsByMosqueId(mosqueId: string): Promise<ReligiousEvent[]> {
  return MOCK_EVENTS.filter((event) => event.mosqueId === mosqueId);
}

export function getEventDateTime(event: Pick<ReligiousEvent, 'date' | 'time'>): Date {
  return new Date(`${event.date}T${event.time}:00`);
}

export function getUpcomingEvents(events: ReligiousEvent[], now: Date = new Date()): ReligiousEvent[] {
  return events
    .filter((event) => getEventDateTime(event).getTime() >= now.getTime())
    .sort((a, b) => getEventDateTime(a).getTime() - getEventDateTime(b).getTime());
}

export function formatEventDateTime(event: Pick<ReligiousEvent, 'date' | 'time'>): string {
  const dateTime = getEventDateTime(event);
  const datePart = dateTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return `${datePart} à ${event.time}`;
}
