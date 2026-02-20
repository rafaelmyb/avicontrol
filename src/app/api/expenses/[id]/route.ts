import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { PrismaExpenseRepository } from "@/modules/finance/infrastructure/prisma-expense-repository";

const updateBodySchema = z.object({
  amount: z.number().optional(),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  date: z.string().optional(),
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
  const repo = new PrismaExpenseRepository();
  const expense = await repo.findById(id, session.user.id);
  if (!expense) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: expense.id,
    userId: expense.userId,
    amount: expense.amount,
    description: expense.description,
    category: expense.category,
    date: expense.date.toISOString(),
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  });
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
  try {
    const body = await request.json();
    const parsed = updateBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const repo = new PrismaExpenseRepository();
    const data: Partial<{ amount: number; description: string | null; category: string | null; date: Date }> = {};
    if (parsed.data.amount != null) data.amount = parsed.data.amount;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.category !== undefined) data.category = parsed.data.category;
    if (parsed.data.date != null) data.date = new Date(parsed.data.date);
    const expense = await repo.update(id, session.user.id, data);
    if (!expense) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      id: expense.id,
      userId: expense.userId,
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      date: expense.date.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
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
  const repo = new PrismaExpenseRepository();
  const deleted = await repo.delete(id, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
