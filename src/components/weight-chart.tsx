"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import { addDays, parseISO } from "date-fns";
import { movingAverage, sortEntries, type Entry } from "@/lib/analytics";
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

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function WeightChart({
  entries,
  targetWeight,
}: {
  entries: Entry[];
  targetWeight: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [range, setRange] = useState<RangeKey>("3M");

  const series = useMemo(() => {
    const sorted = sortEntries(entries);
    const ma = movingAverage(sorted, 7);
    const daily = sorted.map((e) => [e.date, e.weight] as [string, number]);
    const avg = sorted.map(
      (e, i) => [e.date, ma[i]] as [string, number | null],
    );

    const days = RANGE_DAYS[range];
    if (days === null || sorted.length === 0) return { daily, avg };

    const latest = parseISO(sorted[sorted.length - 1].date);
    const cutoff = addDays(latest, -days);
    const inRange = (d: string) => parseISO(d) >= cutoff;
    return {
      daily: daily.filter(([d]) => inRange(d)),
      avg: avg.filter(([d]) => inRange(d)),
    };
  }, [entries, range]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = echarts.init(containerRef.current);
    chartRef.current = chart;
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const weightColor = cssVar("--chart-1", "#fafafa"); // weight line (white)
    const trendColor = cssVar("--chart-2", "#22c55e"); // 7-day avg (success)
    const muted = cssVar("--muted-foreground", "#a1a1aa");
    const border = cssVar("--border", "#27272a");
    const card = cssVar("--card", "#18181b");

    const option: echarts.EChartsOption = {
      grid: { left: 40, right: 16, top: 16, bottom: 48 },
      textStyle: { fontFamily: "var(--font-sans)" },
      tooltip: {
        trigger: "axis",
        backgroundColor: card,
        borderColor: border,
        textStyle: { color: "#fafafa" },
        valueFormatter: (v) =>
          v == null ? "—" : `${Number(v).toFixed(1)} kg`,
      },
      legend: {
        data: ["Weight", "7-day trend"],
        bottom: 0,
        textStyle: { color: muted },
        icon: "roundRect",
        itemWidth: 14,
        itemHeight: 3,
      },
      xAxis: {
        type: "time",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: muted, hideOverlap: true },
      },
      yAxis: {
        type: "value",
        scale: true,
        splitLine: { lineStyle: { color: border, type: "dashed" } },
        axisLabel: { color: muted, formatter: "{value}" },
      },
      dataZoom: [{ type: "inside", filterMode: "none" }],
      series: [
        {
          name: "Weight",
          type: "line",
          showSymbol: false,
          symbolSize: 5,
          data: series.daily,
          lineStyle: { color: weightColor, width: 1.5 },
          itemStyle: { color: weightColor },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(250,250,250,0.10)" },
              { offset: 1, color: "rgba(250,250,250,0)" },
            ]),
          },
          markLine:
            targetWeight != null
              ? {
                  silent: true,
                  symbol: "none",
                  lineStyle: { color: muted, type: "dashed", width: 1 },
                  label: {
                    formatter: `Goal ${targetWeight} kg`,
                    color: muted,
                    position: "insideEndTop",
                  },
                  data: [{ yAxis: targetWeight }],
                }
              : undefined,
        },
        {
          name: "7-day trend",
          type: "line",
          smooth: true,
          showSymbol: false,
          connectNulls: true,
          data: series.avg,
          lineStyle: { color: trendColor, width: 2.5 },
          itemStyle: { color: trendColor },
        },
      ],
    };
    chart.setOption(option, { replaceMerge: ["series"] });
  }, [series, targetWeight]);

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
        <div ref={containerRef} className="h-72 w-full" />
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            No data to chart yet — add a weight entry to get started.
          </div>
        )}
      </div>
    </div>
  );
}
