import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/** Keep insights tight — max 3 sentences (Design Guidelines §8). */
function clampSentences(text: string, max = 3): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (!sentences) return text.trim();
  return sentences.slice(0, max).join(" ").trim();
}

export function AIInsightCard({
  text,
  estimatedCompletionDate,
  hasEntries,
}: {
  text: string;
  estimatedCompletionDate: string | null;
  hasEntries: boolean;
}) {
  return (
    <Card className="gap-0 p-6">
      <span className="flex items-center gap-2 text-sm font-medium text-info">
        <SparklesIcon className="size-4" />
        AI Insight
      </span>

      <p className="mt-3 text-sm leading-relaxed text-foreground/90">
        {hasEntries
          ? clampSentences(text)
          : "Log a few entries and Forma will start reading your trend."}
      </p>

      {estimatedCompletionDate && (
        <div className="mt-4 flex flex-col gap-0.5 rounded-2xl bg-secondary/60 px-4 py-3">
          <span className="text-xs text-muted-foreground">Estimated goal date</span>
          <span className="text-sm font-medium tabular-nums">
            {format(parseISO(estimatedCompletionDate), "d MMM yyyy")}
          </span>
        </div>
      )}

      {hasEntries && (
        <Button asChild variant="ghost" size="sm" className="mt-4 w-fit px-0">
          <Link href="/insights" className="text-muted-foreground hover:text-foreground">
            See full insight
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      )}
    </Card>
  );
}
