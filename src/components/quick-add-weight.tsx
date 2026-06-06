"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { todayISO } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export function QuickAddWeight({
  defaultWeight,
  compact = false,
}: {
  defaultWeight?: number | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      weight: data.get("weight"),
      entryDate: data.get("entryDate"),
      notes: data.get("notes") ?? "",
    };

    setLoading(true);
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Failed to save" }));
      toast.error(error ?? "Failed to save entry");
      return;
    }
    toast.success("Weight logged");
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <div className={compact ? "grid grid-cols-2 gap-4" : "grid gap-4 sm:grid-cols-3"}>
          <Field>
            <FieldLabel htmlFor="weight">Weight (kg)</FieldLabel>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.1"
              min="1"
              inputMode="decimal"
              placeholder="72.5"
              defaultValue={defaultWeight ?? undefined}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="entryDate">Date</FieldLabel>
            <Input
              id="entryDate"
              name="entryDate"
              type="date"
              defaultValue={todayISO()}
              max={todayISO()}
              required
            />
          </Field>
          {!compact && (
            <Field>
              <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
              <Input id="notes" name="notes" placeholder="Post-workout, morning…" />
            </Field>
          )}
        </div>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? <Spinner data-icon="inline-start" /> : <PlusIcon data-icon="inline-start" />}
          Log weight
        </Button>
      </FieldGroup>
    </form>
  );
}
