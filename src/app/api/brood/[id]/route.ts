import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { PrismaBroodCycleRepository } from "@/modules/brood/infrastructure/prisma-brood-repository";
import { PrismaChickenRepository } from "@/modules/chicken/infrastructure/prisma-chicken-repository";
import { getBroodCycle } from "@/modules/brood/application/get-brood-cycle";
import { updateBroodCycle } from "@/modules/brood/application/update-brood-cycle";

const updateBodySchema = z.object({
  actualHatchedCount: z.number().int().min(0).optional(),
  status: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const repo = new PrismaBroodCycleRepository();
  const cycle = await getBroodCycle(repo, id, session.user.id);
  if (!cycle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(cycle);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const repo = new PrismaBroodCycleRepository();
  const deleted = await repo.delete(id, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const repo = new PrismaBroodCycleRepository();
  const chickenRepo = new PrismaChickenRepository();
  const cycle = await getBroodCycle(repo, id, session.user.id);
  if (!cycle) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const body = await request.json();
    const parsed = updateBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const updated = await updateBroodCycle(
      repo,
      id,
      parsed.data,
      chickenRepo,
      session.user.id
    );
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
