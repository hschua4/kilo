import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeStats } from "@/lib/analytics";
import { getUserEntries, toAnalyticsEntries } from "@/lib/entries";
import { generateInsight } from "@/lib/insights";

export async function POST() {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const insight = await generateInsight(stats, analyticsEntries);
  return NextResponse.json({ insight, stats });
}
