import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { PrismaRevenueRepository } from "@/modules/finance/infrastructure/prisma-revenue-repository";
import { createRevenue } from "@/modules/finance/application/create-revenue";

const createBodySchema = z.object({
  amount: z.number(),
  description: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  date: z.string().min(1),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end date required" },
      { status: 400 }
    );
  }
  const repo = new PrismaRevenueRepository();
  const list = await repo.findByUserIdAndDateRange(
    session.user.id,
    new Date(start),
    new Date(end)
  );
  return NextResponse.json(
    list.map((e) => ({
      id: e.id,
      amount: e.amount,
      description: e.description,
      source: e.source,
      date: e.date.toISOString(),
    }))
  );
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
    const repo = new PrismaRevenueRepository();
    const revenue = await createRevenue(repo, {
      userId: session.user.id,
      amount: parsed.data.amount,
      description: parsed.data.description ?? null,
      source: parsed.data.source ?? null,
      date: new Date(parsed.data.date),
    });
    return NextResponse.json(revenue);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
