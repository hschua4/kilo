import Link from "next/link";
import { TargetIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Forma goal progress (Design Guidelines §8) — target number, progress bar,
 * and remaining distance. Falls back to a set-goal CTA when no goal exists.
 */
export function GoalProgressCard({
  targetWeight,
  progressPercent,
  remaining,
}: {
  targetWeight: number | null;
  progressPercent: number | null;
  remaining: number | null;
}) {
  if (targetWeight === null) {
    return (
      <Card className="justify-between gap-4 p-6">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <TargetIcon className="size-4" />
            Goal
          </span>
          <p className="text-sm text-muted-foreground">
            Set a target weight to unlock progress and projections.
          </p>
        </div>
        <Button asChild className="w-fit">
          <Link href="/goal">Set your goal</Link>
        </Button>
      </Card>
    );
  }

  const pct = progressPercent ?? 0;

  return (
    <Card className="gap-0 p-6">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <TargetIcon className="size-4" />
        Goal
      </span>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">
          {targetWeight.toFixed(1)}
        </span>
        <span className="text-base font-medium text-muted-foreground">kg</span>
      </div>

      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-success transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-medium tabular-nums">{pct.toFixed(0)}% complete</span>
        {remaining !== null && (
          <span className="text-muted-foreground tabular-nums">
            {Math.abs(remaining).toFixed(1)} kg to go
          </span>
        )}
      </div>
    </Card>
  );
}
