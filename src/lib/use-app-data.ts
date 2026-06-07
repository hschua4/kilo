"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SerializedEntry } from "@/lib/entries";

/** Goal shape returned by /api/goal (the fields the UI consumes). */
export type GoalData = {
  startWeight: number;
  targetWeight: number;
  weeklyTargetRate: number;
} | null;

export type AppData = {
  entries: SerializedEntry[];
  goal: GoalData;
  /** True until the first fetch resolves. */
  loading: boolean;
  error: string | null;
  /** Re-fetch entries and goal (e.g. after a mutation). */
  refetch: () => void;
};

/**
 * Client-side loader for the authenticated app. Fetches the user's entries and
 * goal from the API routes and redirects to /sign-in on a 401. This replaces
 * the previous server-component data fetching so every page renders on the
 * client.
 */
export function useAppData(): AppData {
  const router = useRouter();
  const [entries, setEntries] = useState<SerializedEntry[]>([]);
  const [goal, setGoal] = useState<GoalData>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [entriesRes, goalRes] = await Promise.all([
          fetch("/api/entries"),
          fetch("/api/goal"),
        ]);

        if (entriesRes.status === 401 || goalRes.status === 401) {
          router.replace("/sign-in");
          return;
        }
        if (!entriesRes.ok || !goalRes.ok) {
          throw new Error("Failed to load your data");
        }

        const entriesJson = (await entriesRes.json()) as {
          entries: SerializedEntry[];
        };
        const goalJson = (await goalRes.json()) as { goal: GoalData };

        if (cancelled) return;
        setEntries(entriesJson.entries);
        setGoal(goalJson.goal);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router, tick]);

  return { entries, goal, loading, error, refetch };
}
