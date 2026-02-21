import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { PrismaChickenRepository } from "@/modules/chicken/infrastructure/prisma-chicken-repository";
import { createChicken } from "@/modules/chicken/application/create-chicken";
import { PrismaExpenseRepository } from "@/modules/finance/infrastructure/prisma-expense-repository";
import { createExpense } from "@/modules/finance/application/create-expense";
import { listChickensByUser } from "@/modules/chicken/application/list-chickens";

const createBodySchema = z.object({
  name: z.string().min(1),
  breed: z.string().min(1),
  birthDate: z.string().min(1),
  status: z.enum([
    "chick",
    "pullet",
    "laying",
    "brooding",
    "recovering",
    "retired",
    "sold",
    "deceased",
  ]),
  source: z.enum(["purchased", "hatched"]).optional(),
  purchasePrice: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((v) =>
      v === "" || v === undefined || v === null ? null : Number(v)
    ),
});

const CHICKEN_STATUSES = [
  "chick",
  "pullet",
  "laying",
  "brooding",
  "recovering",
  "retired",
  "sold",
  "deceased",
] as const;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
  const skip = (page - 1) * limit;
  const status = searchParams.get("status") ?? undefined;
  const batchName = searchParams.get("batchName") ?? undefined;
  const orderBy = (searchParams.get("orderBy") as "createdAt" | "name" | "birthDate") || "createdAt";
  const orderDirection = (searchParams.get("orderDirection") as "asc" | "desc") || "desc";

  if (status && !CHICKEN_STATUSES.includes(status as (typeof CHICKEN_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const repo = new PrismaChickenRepository();
  const result = await listChickensByUser(repo, session.user.id, {
    skip,
    take: limit,
    status,
    batchName,
    orderBy,
    orderDirection,
  });
  return NextResponse.json({
    chickens: result.chickens,
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
    const { name, breed, birthDate, status, source, purchasePrice } = parsed.data;
    const repo = new PrismaChickenRepository();
    const chicken = await createChicken(repo, {
      userId: session.user.id,
      name,
      breed,
      birthDate: new Date(birthDate),
      status,
      source: source ?? "purchased",
      purchasePrice: purchasePrice ?? null,
    });
    const effectiveSource = source ?? "purchased";
    const effectivePrice = purchasePrice ?? null;
    if (effectiveSource === "purchased" && effectivePrice != null && effectivePrice > 0) {
      const expenseRepo = new PrismaExpenseRepository();
      await createExpense(expenseRepo, {
        userId: session.user.id,
        amount: effectivePrice,
        description: `Compra de galinha: ${name}`,
        category: "compra_de_galinha",
        date: new Date(),
        chickenId: chicken.id,
      });
    }
    return NextResponse.json(chicken);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
