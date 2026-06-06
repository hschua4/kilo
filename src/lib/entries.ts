import { prisma } from "@/lib/prisma";
import { toISODate } from "@/lib/dates";
import type { Entry } from "@/lib/analytics";

export type SerializedEntry = {
  id: string;
  weight: number;
  notes: string | null;
  entryDate: string; // yyyy-MM-dd
  createdAt: string;
};

/** Fetch a user's entries ascending by date, serialized for the client. */
export async function getUserEntries(userId: string): Promise<SerializedEntry[]> {
  const rows = await prisma.weightEntry.findMany({
    where: { userId },
    orderBy: { entryDate: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    weight: r.weight,
    notes: r.notes,
    entryDate: toISODate(r.entryDate),
    createdAt: r.createdAt.toISOString(),
  }));
}

/** Reduce serialized entries to the shape the analytics module expects. */
export function toAnalyticsEntries(entries: SerializedEntry[]): Entry[] {
  return entries.map((e) => ({ date: e.entryDate, weight: e.weight }));
}
