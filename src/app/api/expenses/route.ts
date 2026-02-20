import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { PrismaExpenseRepository } from "@/modules/finance/infrastructure/prisma-expense-repository";
import { createExpense } from "@/modules/finance/application/create-expense";

const createBodySchema = z.object({
  amount: z.number(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
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
  const repo = new PrismaExpenseRepository();
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
      category: e.category,
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
    const repo = new PrismaExpenseRepository();
    const expense = await createExpense(repo, {
      userId: session.user.id,
      amount: parsed.data.amount,
      description: parsed.data.description ?? null,
      category: parsed.data.category ?? null,
      date: new Date(parsed.data.date),
    });
    return NextResponse.json(expense);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
