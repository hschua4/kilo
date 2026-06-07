import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Trend = "down" | "up" | "flat";
type Tone = "good" | "bad" | "neutral";

/**
 * Kilo hero metric — the single dominant number on the screen.
 * Number first, context second, trend third (Design Guidelines §8).
 */
export function MetricHero({
  value,
  unit,
  label,
  change,
  changeLabel,
  trend = "flat",
  tone = "neutral",
}: {
  value: string;
  unit?: string;
  label: string;
  change?: string;
  changeLabel?: string;
  trend?: Trend;
  tone?: Tone;
}) {
  const TrendIcon =
    trend === "down" ? ArrowDownIcon : trend === "up" ? ArrowUpIcon : MinusIcon;

  return (
    <Card className="gap-0 p-6">
      <div className="flex items-baseline gap-2">
        <span className="font-numeric text-6xl font-bold leading-none tracking-tight tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xl font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <span className="mt-3 text-sm text-muted-foreground">{label}</span>

      {change && (
        <div className="mt-5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium tabular-nums",
              tone === "good" && "text-success",
              tone === "bad" && "text-warning",
              tone === "neutral" && "text-muted-foreground",
            )}
          >
            <TrendIcon className="size-3.5" />
            {change}
            {changeLabel && (
              <span className="font-normal text-muted-foreground">
                · {changeLabel}
              </span>
            )}
          </span>
        </div>
      )}
    </Card>
  );
}
