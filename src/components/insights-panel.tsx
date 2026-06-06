"use client";

import { useState } from "react";
import { SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

export function InsightsPanel({
  initialText,
  canGenerate,
}: {
  initialText: string;
  canGenerate: boolean;
}) {
  const [text, setText] = useState(initialText);
  const [source, setSource] = useState<"ai" | "fallback" | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const res = await fetch("/api/insights", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      toast.error("Could not generate insight");
      return;
    }
    const data = await res.json();
    setText(data.insight.text);
    setSource(data.insight.source);
    if (data.insight.source === "fallback") {
      toast.info("Showing a rule-based insight (no AI key configured).");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : (
        <p className="text-sm leading-relaxed">{text}</p>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={generate} disabled={loading || !canGenerate} size="sm">
          {loading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <SparklesIcon data-icon="inline-start" />
          )}
          {source ? "Regenerate" : "Generate AI insight"}
        </Button>
        {source === "ai" && <Badge variant="secondary">AI generated</Badge>}
        {source === "fallback" && <Badge variant="outline">Rule-based</Badge>}
      </div>
    </div>
  );
}
