import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserEntries, toAnalyticsEntries } from "@/lib/entries";
import { computeStats, type DashboardStats } from "@/lib/analytics";
import { fallbackInsight } from "@/lib/insights";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MetricHero } from "@/components/metric-hero";
import { GoalProgressCard } from "@/components/goal-progress-card";
import { AIInsightCard } from "@/components/ai-insight-card";
import { WeightChart } from "@/components/weight-chart";

/** Is a weight change moving the user toward their goal? */
function changeTone(
  change: number | null,
  direction: DashboardStats["direction"],
): "good" | "bad" | "neutral" {
  if (change === null || !direction || direction === "maintain") return "neutral";
  if (Math.abs(change) < 0.05) return "neutral";
  if (direction === "lose") return change < 0 ? "good" : "bad";
  return change > 0 ? "good" : "bad";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [entries, goal] = await Promise.all([
    getUserEntries(user.id),
    prisma.goal.findUnique({ where: { userId: user.id } }),
  ]);

  const analyticsEntries = toAnalyticsEntries(entries);
  const stats = computeStats(
    analyticsEntries,
    goal
      ? {
          startWeight: goal.startWeight,
          targetWeight: goal.targetWeight,
          weeklyTargetRate: goal.weeklyTargetRate,
        }
      : null,
  );

  const hasEntries = entries.length > 0;

  const monthly = stats.monthlyChange;
  const heroTrend =
    monthly === null || Math.abs(monthly) < 0.05
      ? "flat"
      : monthly < 0
        ? "down"
        : "up";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Hi, {user.name.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-muted-foreground">Your progress at a glance.</p>
        </div>
      </div>

      {!hasEntries ? (
        <Card className="items-center gap-2 px-6 py-14 text-center">
          <h2 className="text-lg font-semibold">Start tracking</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Log your first weight to unlock trends, goal projections, and insights.
          </p>
          <Button asChild className="mt-4">
            <Link href="/log">
              <PlusIcon data-icon="inline-start" />
              Log first entry
            </Link>
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricHero
              value={
                stats.currentWeight !== null
                  ? stats.currentWeight.toFixed(1)
                  : "—"
              }
              unit="kg"
              label="Current Weight"
              change={monthly !== null ? `${Math.abs(monthly).toFixed(1)} kg` : undefined}
              changeLabel="Last 30 days"
              trend={heroTrend}
              tone={changeTone(monthly, stats.direction)}
            />
            <GoalProgressCard
              targetWeight={stats.targetWeight}
              progressPercent={stats.progressPercent}
              remaining={stats.remaining}
            />
          </div>

          <Card className="gap-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Weight Trend</h2>
              <span className="text-xs text-muted-foreground">
                Daily · 7-day average
              </span>
            </div>
            <WeightChart entries={analyticsEntries} targetWeight={stats.targetWeight} />
          </Card>

          <AIInsightCard
            text={fallbackInsight(stats)}
            estimatedCompletionDate={stats.estimatedCompletionDate}
            hasEntries={hasEntries}
          />
        </>
      )}
    </div>
  );
}
