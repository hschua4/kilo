import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { entryCreateSchema } from "@/lib/validation";
import { getUserEntries } from "@/lib/entries";
import { parseDateOnly } from "@/lib/dates";

export async function GET() {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await getUserEntries(user.id);
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = entryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { weight, entryDate, notes } = parsed.data;

  const existing = await prisma.weightEntry.findUnique({
    where: { userId_entryDate: { userId: user.id, entryDate: parseDateOnly(entryDate) } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An entry already exists for that date. Edit it instead." },
      { status: 409 },
    );
  }

  const entry = await prisma.weightEntry.create({
    data: {
      userId: user.id,
      weight,
      entryDate: parseDateOnly(entryDate),
      notes: notes ? notes : null,
    },
  });
  return NextResponse.json({ id: entry.id }, { status: 201 });
}
