import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { entryUpdateSchema } from "@/lib/validation";
import { parseDateOnly } from "@/lib/dates";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = entryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const existing = await prisma.weightEntry.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { weight, entryDate, notes } = parsed.data;

  // Guard against colliding with another entry on the new date.
  if (entryDate) {
    const clash = await prisma.weightEntry.findUnique({
      where: {
        userId_entryDate: { userId: user.id, entryDate: parseDateOnly(entryDate) },
      },
    });
    if (clash && clash.id !== id) {
      return NextResponse.json(
        { error: "Another entry already exists for that date." },
        { status: 409 },
      );
    }
  }

  await prisma.weightEntry.update({
    where: { id },
    data: {
      ...(weight !== undefined ? { weight } : {}),
      ...(entryDate ? { entryDate: parseDateOnly(entryDate) } : {}),
      ...(notes !== undefined ? { notes: notes ? notes : null } : {}),
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.weightEntry.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.weightEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
