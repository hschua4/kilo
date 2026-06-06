import type { DashboardStats, Entry } from "@/lib/analytics";

export type InsightResult = {
  text: string;
  source: "ai" | "fallback";
};

/**
 * Deterministic, rule-based insight used when no AI key is configured (or when
 * the AI call fails). Keeps the feature fully functional offline.
 */
export function fallbackInsight(stats: DashboardStats): string {
  if (stats.entryCount === 0) {
    return "No entries yet. Log your weight a few days in a row and Kilo will start spotting trends and projecting your goal date.";
  }
  const parts: string[] = [];
  const rate = stats.observedWeeklyRate;

  if (rate !== null && Math.abs(rate) >= 0.05) {
    const dir = rate < 0 ? "decreasing" : "increasing";
    parts.push(
      `Your weight is ${dir} at an average of ${Math.abs(rate).toFixed(2)} kg per week.`,
    );
  } else if (stats.entryCount >= 2) {
    parts.push("Your weight has been roughly stable recently.");
  }

  if (stats.plateau) {
    parts.push(
      "Progress has plateaued — consider revisiting your routine or adjusting your target pace.",
    );
  }

  if (stats.targetWeight !== null && stats.remaining !== null) {
    parts.push(
      `You have ${Math.abs(stats.remaining).toFixed(1)} kg to go to reach ${stats.targetWeight} kg.`,
    );
    if (stats.estimatedWeeks !== null && stats.estimatedCompletionDate) {
      parts.push(
        `At this pace your target could be reached in about ${Math.round(
          stats.estimatedWeeks,
        )} weeks (around ${stats.estimatedCompletionDate}).`,
      );
    } else if (rate !== null && Math.abs(rate) < 0.05) {
      parts.push(
        "Your current trend isn't moving you toward the target yet — a small consistent change should get things going.",
      );
    }
  }

  return parts.join(" ");
}

function buildPrompt(stats: DashboardStats, entries: Entry[]): string {
  const recent = entries.slice(-30);
  return [
    "Here is a user's weight tracking data. Write a concise, encouraging progress insight (2-4 sentences).",
    "Focus on: the trend, any plateau, and realistic goal progress. Avoid medical advice. Use kilograms.",
    "",
    "Summary statistics:",
    JSON.stringify(
      {
        currentWeight: stats.currentWeight,
        startWeight: stats.startWeight,
        targetWeight: stats.targetWeight,
        remainingToTarget: stats.remaining,
        weeklyChange: stats.weeklyChange,
        monthlyChange: stats.monthlyChange,
        observedWeeklyRate: stats.observedWeeklyRate,
        direction: stats.direction,
        plateau: stats.plateau,
        estimatedWeeks: stats.estimatedWeeks,
        estimatedCompletionDate: stats.estimatedCompletionDate,
        entryCount: stats.entryCount,
      },
      null,
      2,
    ),
    "",
    "Recent entries (date, weight kg):",
    recent.map((e) => `${e.date}: ${e.weight}`).join("\n"),
  ].join("\n");
}

export async function generateInsight(
  stats: DashboardStats,
  entries: Entry[],
): Promise<InsightResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-haiku";

  if (!apiKey) {
    return { text: fallbackInsight(stats), source: "fallback" };
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
        "X-Title": "Kilo",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You are a supportive weight-tracking analyst. You write short, specific, data-grounded insights. No medical advice, no markdown headings.",
          },
          { role: "user", content: buildPrompt(stats, entries) },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[Kilo] OpenRouter error", res.status, await res.text());
      return { text: fallbackInsight(stats), source: "fallback" };
    }

    const data = await res.json();
    const text: string | undefined = data?.choices?.[0]?.message?.content?.trim();
    if (!text) return { text: fallbackInsight(stats), source: "fallback" };
    return { text, source: "ai" };
  } catch (err) {
    console.error("[Kilo] OpenRouter request failed", err);
    return { text: fallbackInsight(stats), source: "fallback" };
  }
}
