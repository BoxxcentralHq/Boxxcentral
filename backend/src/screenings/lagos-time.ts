const LAGOS_OFFSET_MS = 60 * 60 * 1000;

export function lagosDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+01:00`);
}

export function lagosToday(now: Date = new Date()): string {
  return new Date(now.getTime() + LAGOS_OFFSET_MS).toISOString().slice(0, 10);
}

export function isCalendarDate(date: string): boolean {
  const d = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
