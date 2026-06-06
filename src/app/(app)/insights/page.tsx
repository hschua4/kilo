import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserEntries, toAnalyticsEntries } from "@/lib/entries";
import { computeStats } from "@/lib/analytics";
import { fallbackInsight } from "@/lib/insights";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightsPanel } from "@/components/insights-panel";
import { StatCard } from "@/components/stat-card";

export default async function InsightsPage() {
  const user = await requireUser();
  const [entries, goal] = await Promise.all([
    getUserEntries(user.id),
    prisma.goal.findUnique({ where: { userId: user.id } }),
  ]);

  const stats = computeStats(
    toAnalyticsEntries(entries),
    goal
      ? {
          startWeight: goal.startWeight,
          targetWeight: goal.targetWeight,
          weeklyTargetRate: goal.weeklyTargetRate,
        }
      : null,
  );

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
