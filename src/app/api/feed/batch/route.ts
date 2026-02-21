import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { FeedType } from "@prisma/client";

const BATCH_QUANTITY_MIN = 2;
const BATCH_QUANTITY_MAX = 50;

const feedTypeEnum = z.enum(["pre_inicial", "crescimento", "postura"]);

const batchBodySchema = z.object({
  batchName: z.string().min(1),
  quantity: z
    .number()
    .int()
    .min(BATCH_QUANTITY_MIN)
    .max(BATCH_QUANTITY_MAX),
  feedType: feedTypeEnum,
  weightKg: z.number().min(0),
  price: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((v) =>
      v === "" || v === undefined || v === null ? null : Number(v)
    ),
  consumptionPerBirdGrams: z.number().min(0),
  purchaseDate: z.string().min(1),
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
      feedType,
      weightKg,
      price,
      consumptionPerBirdGrams,
      purchaseDate,
    } = parsed.data;
    const userId = session.user.id;
    const purchaseDateObj = new Date(purchaseDate);
    const effectivePrice = price ?? null;
    const hasExpense = effectivePrice != null && effectivePrice > 0;

    const feeds = await prisma.$transaction(async (tx) => {
      const data = Array.from({ length: quantity }, (_, i) => ({
        userId,
        name: `${batchName} - ${i + 1}`,
        batchName,
        feedType: feedType as FeedType,
        weightKg,
        price: effectivePrice,
        consumptionPerBirdGrams,
        purchaseDate: purchaseDateObj,
      }));
      const created = await tx.feedInventory.createManyAndReturn({ data });
      if (hasExpense && created.length > 0) {
        const expenseRows = created.map((f) => ({
          userId,
          amount: effectivePrice!,
          description: `Compra de ração: ${f.name}`,
          category: "compra_de_ração",
          date: purchaseDateObj,
          chickenId: null,
          feedInventoryId: f.id,
        }));
        await tx.expense.createMany({ data: expenseRows });
      }
      return created;
    });

    return NextResponse.json({
      list: feeds.map((f) => ({
        id: f.id,
        name: f.name,
        batchName: f.batchName,
        feedType: f.feedType,
        weightKg: f.weightKg,
        price: f.price,
        consumptionPerBirdGrams: f.consumptionPerBirdGrams,
        purchaseDate: f.purchaseDate.toISOString(),
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
      created: feeds.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
