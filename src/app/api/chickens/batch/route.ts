import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ChickenStatus, ChickenSource } from "@prisma/client";

const BATCH_QUANTITY_MIN = 2;
const BATCH_QUANTITY_MAX = 50;

const batchBodySchema = z.object({
  batchName: z.string().min(1),
  quantity: z
    .number()
    .int()
    .min(BATCH_QUANTITY_MIN)
    .max(BATCH_QUANTITY_MAX),
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const parsed = batchBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const {
      batchName,
      quantity,
      breed,
      birthDate,
      status,
      source,
      purchasePrice,
    } = parsed.data;
    const userId = session.user.id;
    const sourceVal = (source ?? "purchased") as ChickenSource;
    const statusVal = status as ChickenStatus;
    const birthDateObj = new Date(birthDate);
    const effectivePrice = purchasePrice ?? null;
    const hasExpense =
      sourceVal === "purchased" && effectivePrice != null && effectivePrice > 0;

    const chickens = await prisma.$transaction(async (tx) => {
      const data = Array.from({ length: quantity }, (_, i) => ({
        userId,
        name: `${batchName} - ${i + 1}`,
        batchName,
        breed,
        birthDate: birthDateObj,
        status: statusVal,
        source: sourceVal,
        purchasePrice: effectivePrice,
      }));
      const created = await tx.chicken.createManyAndReturn({ data });
      if (hasExpense && created.length > 0) {
        const expenseRows = created.map((c) => ({
          userId,
          amount: effectivePrice!,
          description: `Compra de galinha: ${c.name}`,
          category: "compra_de_galinha",
          date: new Date(),
          chickenId: c.id,
          feedInventoryId: null,
        }));
        await tx.expense.createMany({ data: expenseRows });
      }
      return created;
    });

    return NextResponse.json({
      chickens: chickens.map((c) => ({
        id: c.id,
        name: c.name,
        batchName: c.batchName,
        breed: c.breed,
        birthDate: c.birthDate.toISOString(),
        status: c.status,
        source: c.source,
        purchasePrice: c.purchasePrice,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      created: chickens.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
