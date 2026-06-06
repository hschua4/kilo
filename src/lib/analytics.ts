import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

export type Entry = {
  /** ISO date, yyyy-MM-dd */
  date: string;
  weight: number;
};

export type GoalInput = {
  startWeight: number;
  targetWeight: number;
  weeklyTargetRate: number; // magnitude, kg/week
};

export type DashboardStats = {
  currentWeight: number | null;
  latestDate: string | null;
  startWeight: number | null;
  targetWeight: number | null;
  /** signed: current - target (how far still to go; sign indicates direction) */
  remaining: number | null;
  /** signed: current - start */
  totalChange: number | null;
  /** signed change over trailing 7 days */
  weeklyChange: number | null;
  /** signed change over trailing 30 days */
  monthlyChange: number | null;
  /** signed observed rate, kg/week, from linear regression over recent window */
  observedWeeklyRate: number | null;
  /** goal direction based on start vs target */
  direction: "lose" | "gain" | "maintain" | null;
  /** 0..100, how much of the start→target distance has been covered */
  progressPercent: number | null;
  estimatedWeeks: number | null;
  estimatedCompletionDate: string | null;
  /** true when recent rate is effectively flat while goal not reached */
  plateau: boolean;
  entryCount: number;
};

/** Sort entries ascending by date (does not mutate input). */
export function sortEntries(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Centered-ish trailing moving average. For each entry, averages the values
 * within the trailing `window` days (inclusive). Returns aligned array.
 */
export function movingAverage(entries: Entry[], window = 7): (number | null)[] {
  const sorted = sortEntries(entries);
  return sorted.map((e, i) => {
    const end = parseISO(e.date);
    let sum = 0;
    let count = 0;
    for (let j = i; j >= 0; j--) {
      const diff = differenceInCalendarDays(end, parseISO(sorted[j].date));
      if (diff > window - 1) break;
      sum += sorted[j].weight;
      count++;
    }
    return count > 0 ? sum / count : null;
  });
}

/** Weight at or before a target date; falls back to the earliest entry. */
function weightAtOrBefore(sorted: Entry[], target: Date): number | null {
  let result: number | null = null;
  for (const e of sorted) {
    if (parseISO(e.date) <= target) result = e.weight;
    else break;
  }
  return result ?? (sorted.length ? sorted[0].weight : null);
}

/**
 * Linear regression of weight over time, returning slope in kg/week.
 * Uses entries within `windowDays` of the latest entry (min 2 points needed).
 */
export function regressionWeeklyRate(
  entries: Entry[],
  windowDays = 28,
): number | null {
  const sorted = sortEntries(entries);
  if (sorted.length < 2) return null;
  const latest = parseISO(sorted[sorted.length - 1].date);
  const pts = sorted
    .filter((e) => differenceInCalendarDays(latest, parseISO(e.date)) <= windowDays)
    .map((e) => ({
      x: differenceInCalendarDays(parseISO(e.date), latest), // days, <= 0
      y: e.weight,
    }));
  if (pts.length < 2) return null;

  const n = pts.length;
  const sumX = pts.reduce((s, p) => s + p.x, 0);
  const sumY = pts.reduce((s, p) => s + p.y, 0);
  const sumXY = pts.reduce((s, p) => s + p.x * p.y, 0);
  const sumXX = pts.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  const slopePerDay = (n * sumXY - sumX * sumY) / denom;
  return slopePerDay * 7; // kg per week
}

function round(n: number | null, dp = 2): number | null {
  if (n === null || Number.isNaN(n)) return null;
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

export function computeStats(
  entries: Entry[],
  goal: GoalInput | null,
): DashboardStats {
  const sorted = sortEntries(entries);
  const empty: DashboardStats = {
    currentWeight: null,
    latestDate: null,
    startWeight: goal?.startWeight ?? null,
    targetWeight: goal?.targetWeight ?? null,
    remaining: null,
    totalChange: null,
    weeklyChange: null,
    monthlyChange: null,
    observedWeeklyRate: null,
    direction: null,
    progressPercent: null,
    estimatedWeeks: null,
    estimatedCompletionDate: null,
    plateau: false,
    entryCount: 0,
  };
  if (sorted.length === 0) return empty;

  const latest = sorted[sorted.length - 1];
  const latestDate = parseISO(latest.date);
  const currentWeight = latest.weight;

  const start = goal?.startWeight ?? sorted[0].weight;
  const target = goal?.targetWeight ?? null;

  const weekAgo = weightAtOrBefore(sorted, addDays(latestDate, -7));
  const monthAgo = weightAtOrBefore(sorted, addDays(latestDate, -30));

  const observedWeeklyRate = regressionWeeklyRate(sorted);

  let direction: DashboardStats["direction"] = null;
  let remaining: number | null = null;
  let progressPercent: number | null = null;
  let estimatedWeeks: number | null = null;
  let estimatedCompletionDate: string | null = null;

  if (target !== null) {
    const span = target - start;
    direction = span < -0.05 ? "lose" : span > 0.05 ? "gain" : "maintain";
    remaining = currentWeight - target;
    if (Math.abs(span) > 0.0001) {
      progressPercent = Math.max(
        0,
        Math.min(100, ((start - currentWeight) / (start - target)) * 100),
      );
    }
    // ETA: only when moving toward the target.
    if (observedWeeklyRate !== null && Math.abs(observedWeeklyRate) > 0.01) {
      const movingTowardTarget =
        (remaining < 0 && observedWeeklyRate > 0) ||
        (remaining > 0 && observedWeeklyRate < 0);
      if (movingTowardTarget) {
        const weeks = Math.abs(remaining) / Math.abs(observedWeeklyRate);
        estimatedWeeks = weeks;
        estimatedCompletionDate = format(
          addDays(latestDate, Math.round(weeks * 7)),
          "yyyy-MM-dd",
        );
      }
    }
  }

  const plateau =
    target !== null &&
    remaining !== null &&
    Math.abs(remaining) > 0.3 &&
    observedWeeklyRate !== null &&
    Math.abs(observedWeeklyRate) < 0.1 &&
    sorted.length >= 4;

  return {
    currentWeight: round(currentWeight),
    latestDate: latest.date,
    startWeight: round(start),
    targetWeight: round(target),
    remaining: round(remaining),
    totalChange: round(currentWeight - start),
    weeklyChange: weekAgo !== null ? round(currentWeight - weekAgo) : null,
    monthlyChange: monthAgo !== null ? round(currentWeight - monthAgo) : null,
    observedWeeklyRate: round(observedWeeklyRate),
    direction,
    progressPercent: round(progressPercent, 0),
    estimatedWeeks: round(estimatedWeeks, 1),
    estimatedCompletionDate,
    plateau,
    entryCount: sorted.length,
  };
}
