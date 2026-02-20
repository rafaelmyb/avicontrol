import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { PrismaChickenRepository } from "@/modules/chicken/infrastructure/prisma-chicken-repository";
import { getChicken } from "@/modules/chicken/application/get-chicken";
import { updateChicken } from "@/modules/chicken/application/update-chicken";
import { deleteChicken } from "@/modules/chicken/application/delete-chicken";
import { PrismaExpenseRepository } from "@/modules/finance/infrastructure/prisma-expense-repository";
import { createExpense } from "@/modules/finance/application/create-expense";

const updateBodySchema = z.object({
  name: z.string().min(1).optional(),
  breed: z.string().min(1).optional(),
  birthDate: z.string().optional(),
  status: z
    .enum([
      "chick",
      "pullet",
      "laying",
      "brooding",
      "recovering",
      "retired",
      "sold",
      "deceased",
    ])
    .optional(),
  source: z.enum(["purchased", "hatched"]).optional(),
  purchasePrice: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((v) =>
      v === "" || v === undefined || v === null ? null : Number(v)
    ),
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
  const repo = new PrismaChickenRepository();
  const chicken = await getChicken(repo, id, session.user.id);
  if (!chicken) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(chicken);
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
    const repo = new PrismaChickenRepository();
    const previous = await getChicken(repo, id, session.user.id);
    const chicken = await updateChicken(repo, id, session.user.id, parsed.data);
    if (!chicken) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const expenseRepo = new PrismaExpenseRepository();
    const linkedExpense = await expenseRepo.findByChickenId(session.user.id, id);
    if (linkedExpense) {
      const updatedName = chicken.name;
      const updatedPrice =
        parsed.data.purchasePrice != null
          ? Number(parsed.data.purchasePrice)
          : linkedExpense.amount;
      await expenseRepo.update(linkedExpense.id, session.user.id, {
        description: `Compra de galinha: ${updatedName}`,
        amount: updatedPrice,
      });
    } else {
      const isNowPurchased = (parsed.data.source ?? previous?.source ?? chicken.source) === "purchased";
      const hasPrice = parsed.data.purchasePrice != null && parsed.data.purchasePrice > 0;
      if (isNowPurchased && hasPrice && previous?.source !== "purchased") {
        const amount = parsed.data.purchasePrice != null ? Number(parsed.data.purchasePrice) : 0;
        if (amount > 0) {
          await createExpense(expenseRepo, {
            userId: session.user.id,
            amount,
            description: `Compra de galinha: ${chicken.name}`,
            category: "compra_de_galinha",
            date: new Date(),
            chickenId: chicken.id,
          });
        }
      }
    }
    return NextResponse.json(chicken);
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
  const repo = new PrismaChickenRepository();
  const deleted = await deleteChicken(repo, id, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
