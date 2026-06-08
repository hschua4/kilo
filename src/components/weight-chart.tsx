"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { addDays, format, parseISO } from "date-fns";
import { sortEntries, type Entry } from "@/lib/analytics";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

type RangeKey = "1M" | "3M" | "6M" | "1Y" | "ALL";

const RANGE_DAYS: Record<RangeKey, number | null> = {
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
  ALL: null,
};

const chartConfig = {
  weight: {
    label: "Weight",
    color: "var(--color-success)",
  },
} satisfies ChartConfig;

type ChartDatum = { date: string; weight: number };

export function WeightChart({
  entries,
  targetWeight,
}: {
  entries: Entry[];
  targetWeight: number | null;
}) {
  const [range, setRange] = useState<RangeKey>("3M");

  const data = useMemo<ChartDatum[]>(() => {
    const sorted = sortEntries(entries);
    const all = sorted.map((e) => ({
      date: e.date,
      weight: e.weight,
    }));

    const days = RANGE_DAYS[range];
    if (days === null || sorted.length === 0) return all;

    const latest = parseISO(sorted[sorted.length - 1].date);
    const cutoff = addDays(latest, -days);
    return all.filter((d) => parseISO(d.date) >= cutoff);
  }, [entries, range]);

  const hasData = entries.length > 0;
  const ranges: RangeKey[] = ["1M", "3M", "6M", "1Y", "ALL"];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <ToggleGroup
          type="single"
          size="sm"
          value={range}
          onValueChange={(v) => v && setRange(v as RangeKey)}
          variant="outline"
        >
          {ranges.map((r) => (
            <ToggleGroupItem key={r} value={r} aria-label={r}>
              {r === "ALL" ? "All" : r}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="relative">
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <ComposedChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-weight)"
                  stopOpacity={0.1}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-weight)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => format(parseISO(value), "MMM d")}
            />
            <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const date = payload?.[0]?.payload?.date as
                      | string
                      | undefined;
                    return date ? format(parseISO(date), "EEE, MMM d") : "";
                  }}
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label ??
                          name}
                      </span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {value == null ? "—" : `${Number(value).toFixed(1)} kg`}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="weight"
              type="monotone"
              fill="url(#fillWeight)"
              stroke="var(--color-weight)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {targetWeight != null && (
              <ReferenceLine
                y={targetWeight}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                label={{
                  value: `Goal ${targetWeight} kg`,
                  position: "insideTopRight",
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                }}
              />
            )}
          </ComposedChart>
        </ChartContainer>
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            No data to chart yet — add a weight entry to get started.
          </div>
        )}
      </div>
    </div>
  );
}
