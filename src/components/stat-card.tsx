import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type Trend = "down" | "up" | "flat";
type Tone = "good" | "bad" | "neutral";

export function StatCard({
  label,
  value,
  unit,
  hint,
  trend,
  tone = "neutral",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  trend?: Trend;
  tone?: Tone;
}) {
  const TrendIcon =
    trend === "down" ? ArrowDownIcon : trend === "up" ? ArrowUpIcon : MinusIcon;

  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold tabular-nums">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {hint && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs text-muted-foreground",
              tone === "good" && "text-emerald-600 dark:text-emerald-400",
              tone === "bad" && "text-orange-600 dark:text-orange-400",
            )}
          >
            {trend && <TrendIcon className="size-3" />}
            {hint}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
