"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { QuickAddWeight } from "@/components/quick-add-weight";
import { useAppData } from "@/lib/use-app-data";

export default function LogPage() {
  const { entries, loading, error, refetch } = useAppData();

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }
  if (error) {
    return <p className="py-16 text-center text-sm text-destructive">{error}</p>;
  }

  const latest = entries.at(-1)?.weight ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Weight log</h1>
        <p className="text-sm text-muted-foreground">
          Add, edit, or remove your weight entries.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add an entry</CardTitle>
          <CardDescription>One entry per day. Editing an existing day? Update it below.</CardDescription>
        </CardHeader>
        <CardContent>
          <QuickAddWeight defaultWeight={latest} onChanged={refetch} />
        </CardContent>
      </Card>
    </div>
  );
}
