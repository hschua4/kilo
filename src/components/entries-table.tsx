"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { SerializedEntry } from "@/lib/entries";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Empty } from "@/components/ui/empty";

export function EntriesTable({ entries }: { entries: SerializedEntry[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<SerializedEntry | null>(null);
  const [deleting, setDeleting] = useState<SerializedEntry | null>(null);
  const [busy, setBusy] = useState(false);

  // Most recent first for the table view.
  const rows = [...entries].reverse();

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const data = new FormData(e.currentTarget);
    setBusy(true);
    const res = await fetch(`/api/entries/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weight: data.get("weight"),
        entryDate: data.get("entryDate"),
        notes: data.get("notes") ?? "",
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Update failed" }));
      toast.error(error ?? "Update failed");
      return;
    }
    toast.success("Entry updated");
    setEditing(null);
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    const res = await fetch(`/api/entries/${deleting.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("Entry deleted");
    setDeleting(null);
    router.refresh();
  }

  if (entries.length === 0) {
    return (
      <Empty className="border border-dashed">
        <p className="text-sm text-muted-foreground">
          No entries yet. Log your first weight above.
        </p>
      </Empty>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Weight</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">
                {format(parseISO(entry.entryDate), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {entry.weight.toFixed(1)} kg
              </TableCell>
              <TableCell className="max-w-40 truncate text-muted-foreground">
                {entry.notes || "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Edit entry"
                    onClick={() => setEditing(entry)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete entry"
                    onClick={() => setDeleting(entry)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit entry</DialogTitle>
            <DialogDescription>Update this weight record.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form onSubmit={saveEdit} id="edit-entry-form">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="edit-weight">Weight (kg)</FieldLabel>
                  <Input
                    id="edit-weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    min="1"
                    defaultValue={editing.weight}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-date">Date</FieldLabel>
                  <Input
                    id="edit-date"
                    name="entryDate"
                    type="date"
                    defaultValue={editing.entryDate}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edit-notes">Notes</FieldLabel>
                  <Input
                    id="edit-notes"
                    name="notes"
                    defaultValue={editing.notes ?? ""}
                    placeholder="Optional"
                  />
                </Field>
              </FieldGroup>
            </form>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="edit-entry-form" disabled={busy}>
              {busy && <Spinner data-icon="inline-start" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting &&
                `This will permanently remove your ${deleting.weight.toFixed(
                  1,
                )} kg entry from ${format(parseISO(deleting.entryDate), "MMM d, yyyy")}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={busy}
            >
              {busy && <Spinner data-icon="inline-start" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
