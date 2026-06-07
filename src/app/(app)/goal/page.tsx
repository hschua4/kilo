"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { GoalForm } from "@/components/goal-form";
import { useAppData } from "@/lib/use-app-data";

export default function GoalPage() {
  const { entries, goal, loading, error, refetch } = useAppData();

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

  const currentWeight = entries.at(-1)?.weight ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your goal</h1>
        <p className="text-sm text-muted-foreground">
          Set a target and pace. Kilo projects your completion date from here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal settings</CardTitle>
          <CardDescription>
            Your starting weight anchors progress; target pace drives the estimate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalForm
            initialGoal={
              goal
                ? {
                    startWeight: goal.startWeight,
                    targetWeight: goal.targetWeight,
                    weeklyTargetRate: goal.weeklyTargetRate,
                  }
                : null
            }
            currentWeight={currentWeight}
            onSaved={refetch}
          />
        </CardContent>
      </Card>
    </div>
  );
}
