import { requireUser } from "@/lib/session";
import { getUserEntries } from "@/lib/entries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuickAddWeight } from "@/components/quick-add-weight";
import { EntriesTable } from "@/components/entries-table";

export default async function LogPage() {
  const user = await requireUser();
  const entries = await getUserEntries(user.id);
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
          <QuickAddWeight defaultWeight={latest} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            {entries.length} {entries.length === 1 ? "entry" : "entries"} recorded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntriesTable entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
