export interface ReligiousEvent {
  id: string;
  title: string;
  date: string; // format ISO, ex. '2026-08-10'
  time: string; // ex. '19:00'
  mosqueId: string;
  description: string;
}
