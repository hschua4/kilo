import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserEntries } from "@/lib/entries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoalForm } from "@/components/goal-form";

export default async function GoalPage() {
  const user = await requireUser();
  const [goal, entries] = await Promise.all([
    prisma.goal.findUnique({ where: { userId: user.id } }),
    getUserEntries(user.id),
  ]);
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
          />
        </CardContent>
      </Card>
    </div>
  );
}
