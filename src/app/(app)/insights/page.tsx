"use client";

import { computeStats, type Entry } from "@/lib/analytics";
import { fallbackInsight } from "@/lib/insights";
import { useAppData } from "@/lib/use-app-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { InsightsPanel } from "@/components/insights-panel";
import { StatCard } from "@/components/stat-card";

export default function InsightsPage() {
  const { entries, goal, loading, error } = useAppData();

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }
  if (error) {
    return <p className="py-16 text-center text-sm text-destructive">{error}</p>;
  }

  const analyticsEntries: Entry[] = entries.map((e) => ({
    date: e.entryDate,
    weight: e.weight,
  }));
  const stats = computeStats(analyticsEntries, goal);

  const rate = stats.observedWeeklyRate;
  const trendLabel =
    rate === null
      ? "Not enough data"
      : Math.abs(rate) < 0.05
        ? "Stable"
        : rate < 0
          ? "Trending down"
          : "Trending up";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI insights</h1>
        <p className="text-sm text-muted-foreground">
          Trend analysis, plateau detection, and goal projection from your data.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Observed pace"
          value={rate !== null ? `${rate > 0 ? "+" : ""}${rate.toFixed(2)}` : "—"}
          unit="kg/wk"
          hint={trendLabel}
        />
        <StatCard
          label="Goal progress"
          value={stats.progressPercent !== null ? `${stats.progressPercent}` : "—"}
          unit="%"
          hint={
            stats.remaining !== null
              ? `${Math.abs(stats.remaining).toFixed(1)} kg remaining`
              : "set a goal"
          }
        />
        <StatCard
          label="Est. completion"
          value={
            stats.estimatedWeeks !== null ? `${Math.round(stats.estimatedWeeks)}` : "—"
          }
          unit="wks"
          hint={stats.estimatedCompletionDate ?? "needs a clear trend"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Plateau detection
            <Badge variant={stats.plateau ? "destructive" : "secondary"}>
              {stats.plateau ? "Plateau detected" : "No plateau"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {stats.plateau
              ? "Your recent rate of change is near zero while you're still away from your target."
              : "Your weight is changing at a normal rate, or you're at your goal."}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress summary</CardTitle>
          <CardDescription>
            Generated from your weight history{goal ? " and goal" : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InsightsPanel
            initialText={fallbackInsight(stats)}
            canGenerate={stats.entryCount > 0}
          />
        </CardContent>
      </Card>
    </div>
  );
}
