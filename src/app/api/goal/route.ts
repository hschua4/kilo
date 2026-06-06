import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/validation";

export async function GET() {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goal = await prisma.goal.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ goal });
}

export async function PUT(req: Request) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const { startWeight, targetWeight, weeklyTargetRate } = parsed.data;

  const goal = await prisma.goal.upsert({
    where: { userId: user.id },
    create: { userId: user.id, startWeight, targetWeight, weeklyTargetRate },
    update: { startWeight, targetWeight, weeklyTargetRate },
  });
  return NextResponse.json({ goal });
}
