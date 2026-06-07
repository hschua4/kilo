"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type GoalData = {
  startWeight: number;
  targetWeight: number;
  weeklyTargetRate: number;
};

export function GoalForm({
  initialGoal,
  currentWeight,
  onSaved,
}: {
  initialGoal: GoalData | null;
  currentWeight: number | null;
  onSaved?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState<number | string>(
    initialGoal?.startWeight ?? currentWeight ?? "",
  );
  const [target, setTarget] = useState<number | string>(
    initialGoal?.targetWeight ?? "",
  );
  const [rate, setRate] = useState<number | string>(
    initialGoal?.weeklyTargetRate ?? 0.5,
  );

  const startNum = Number(start);
  const targetNum = Number(target);
  const rateNum = Number(rate);
  const reference = currentWeight ?? (startNum || null);

  const remaining =
    reference !== null && targetNum > 0 ? reference - targetNum : null;
  const direction =
    remaining === null ? null : remaining > 0.05 ? "lose" : remaining < -0.05 ? "gain" : "maintain";
  const weeks =
    remaining !== null && rateNum > 0 && Math.abs(remaining) > 0.05
      ? Math.abs(remaining) / rateNum
      : null;
  const eta =
    weeks !== null ? format(addDays(new Date(), Math.round(weeks * 7)), "MMM d, yyyy") : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/goal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startWeight: startNum,
        targetWeight: targetNum,
        weeklyTargetRate: rateNum,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Save failed" }));
      toast.error(error ?? "Save failed");
      return;
    }
    toast.success("Goal saved");
    onSaved?.();
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="startWeight">Starting weight (kg)</FieldLabel>
            <Input
              id="startWeight"
              type="number"
              step="0.1"
              min="1"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="targetWeight">Target weight (kg)</FieldLabel>
            <Input
              id="targetWeight"
              type="number"
              step="0.1"
              min="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="weeklyTargetRate">Target pace (kg/week)</FieldLabel>
            <Input
              id="weeklyTargetRate"
              type="number"
              step="0.05"
              min="0.05"
              max="5"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
            <FieldDescription>e.g. 0.5 to lose/gain half a kg per week</FieldDescription>
          </Field>
        </div>

        {remaining !== null && (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            <p>
              Goal: <strong>{direction === "maintain" ? "maintain" : direction}</strong>{" "}
              {direction !== "maintain" && (
                <>
                  <strong>{Math.abs(remaining).toFixed(1)} kg</strong>{" "}
                  {direction === "lose" ? "to lose" : "to gain"}
                </>
              )}
              {reference !== null && (
                <span className="text-muted-foreground">
                  {" "}
                  (from {reference.toFixed(1)} kg to {targetNum.toFixed(1)} kg)
                </span>
              )}
            </p>
            {eta && weeks !== null ? (
              <p className="mt-1 text-muted-foreground">
                At {rateNum} kg/week, estimated completion in ~{Math.round(weeks)} weeks
                — around <strong className="text-foreground">{eta}</strong>.
              </p>
            ) : direction === "maintain" ? (
              <p className="mt-1 text-muted-foreground">You&apos;re at your target. Nice.</p>
            ) : null}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading && <Spinner data-icon="inline-start" />}
          {initialGoal ? "Update goal" : "Set goal"}
        </Button>
      </FieldGroup>
    </form>
  );
}
