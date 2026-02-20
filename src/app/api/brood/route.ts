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

const orderBySchema = z.enum(["expectedHatchDate", "startDate", "createdAt"]).optional();
const orderDirectionSchema = z.enum(["asc", "desc"]).optional();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10) || 10));
  const orderBy = orderBySchema.safeParse(searchParams.get("orderBy") ?? undefined).data ?? "expectedHatchDate";
  const orderDirection = orderDirectionSchema.safeParse(searchParams.get("orderDirection") ?? undefined).data ?? "asc";
  const skip = (page - 1) * limit;

  const broodRepo = new PrismaBroodCycleRepository();
  const result = await listBroodCyclesByUser(broodRepo, session.user.id, {
    orderBy,
    orderDirection,
    skip,
    take: limit,
  });
  return NextResponse.json({
    list: result.list,
    total: result.total,
    page,
    limit,
  });
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
