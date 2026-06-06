import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserEntries, toAnalyticsEntries } from "@/lib/entries";
import { computeStats, type DashboardStats } from "@/lib/analytics";
import { fallbackInsight } from "@/lib/insights";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatCard } from "@/components/stat-card";
import { QuickAddWeight } from "@/components/quick-add-weight";
import { WeightChart } from "@/components/weight-chart";

function signed(n: number | null, dp = 1): string {
  if (n === null) return "—";
  return `${n > 0 ? "+" : ""}${n.toFixed(dp)}`;
}

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
  const quickSummary = fallbackInsight(stats);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hi, {user.name.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s how your progress is tracking.
          </p>
        </div>
      </div>

      {!goal && (
        <Alert>
          <AlertTitle>Set a goal to unlock projections</AlertTitle>
          <AlertDescription>
            Add a target weight and pace to see your remaining distance and
            estimated completion date.{" "}
            <Link href="/goal" className="font-medium underline underline-offset-4">
              Set your goal
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Current"
          value={stats.currentWeight !== null ? stats.currentWeight.toFixed(1) : "—"}
          unit="kg"
          hint={stats.latestDate ? `as of ${stats.latestDate}` : "no entries yet"}
        />
        <StatCard
          label="Goal"
          value={stats.targetWeight !== null ? stats.targetWeight.toFixed(1) : "—"}
          unit="kg"
          hint={
            stats.remaining !== null
              ? `${Math.abs(stats.remaining).toFixed(1)} kg to go`
              : "no goal set"
          }
        />
        <StatCard
          label="Weekly change"
          value={signed(stats.weeklyChange)}
          unit="kg"
          trend={
            stats.weeklyChange === null || Math.abs(stats.weeklyChange) < 0.05
              ? "flat"
              : stats.weeklyChange < 0
                ? "down"
                : "up"
          }
          tone={changeTone(stats.weeklyChange, stats.direction)}
          hint="vs 7 days ago"
        />
        <StatCard
          label="Monthly change"
          value={signed(stats.monthlyChange)}
          unit="kg"
          trend={
            stats.monthlyChange === null || Math.abs(stats.monthlyChange) < 0.05
              ? "flat"
              : stats.monthlyChange < 0
                ? "down"
                : "up"
          }
          tone={changeTone(stats.monthlyChange, stats.direction)}
          hint="vs 30 days ago"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weight trend</CardTitle>
          <CardDescription>Daily weight with a 7-day moving average.</CardDescription>
        </CardHeader>
        <CardContent>
          <WeightChart entries={analyticsEntries} targetWeight={stats.targetWeight} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Log today&apos;s weight</CardTitle>
            <CardDescription>Quick add — takes a few seconds.</CardDescription>
          </CardHeader>
          <CardContent>
            <QuickAddWeight defaultWeight={stats.currentWeight} compact />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-primary" />
              Progress insight
            </CardTitle>
            <CardDescription>A quick read on your trend.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed">
              {hasEntries
                ? quickSummary
                : "Log a few entries and insights will appear here."}
            </p>
            {hasEntries && (
              <Button asChild variant="outline" size="sm" className="w-fit">
                <Link href="/insights">
                  Get AI insights
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
