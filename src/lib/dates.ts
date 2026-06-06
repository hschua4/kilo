/** Format a Date as a UTC yyyy-MM-dd string (matches how @db.Date is stored). */
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Parse a yyyy-MM-dd string into a UTC-midnight Date for @db.Date columns. */
export function parseDateOnly(s: string): Date {
  return new Date(`${s}T00:00:00.000Z`);
}

/** Today as yyyy-MM-dd in the server's local time. */
export function todayISO(): string {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10);
}
