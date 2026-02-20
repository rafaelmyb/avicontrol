import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { PrismaBroodCycleRepository } from "@/modules/brood/infrastructure/prisma-brood-repository";
import { PrismaChickenRepository } from "@/modules/chicken/infrastructure/prisma-chicken-repository";
import { createBroodCycle } from "@/modules/brood/application/create-brood-cycle";
import { listBroodCyclesByUser } from "@/modules/brood/application/list-brood-cycles";

const createBodySchema = z.object({
  chickenId: z.string().min(1),
  startDate: z.string().min(1),
  eggCount: z.number().int().min(0),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const broodRepo = new PrismaBroodCycleRepository();
  const list = await listBroodCyclesByUser(broodRepo, session.user.id);
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = createBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const broodRepo = new PrismaBroodCycleRepository();
    const chickenRepo = new PrismaChickenRepository();
    const cycle = await createBroodCycle(broodRepo, chickenRepo, {
      chickenId: parsed.data.chickenId,
      userId: session.user.id,
      startDate: new Date(parsed.data.startDate),
      eggCount: parsed.data.eggCount,
    });
    return NextResponse.json(cycle);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
