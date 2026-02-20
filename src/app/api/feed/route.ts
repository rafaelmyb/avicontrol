import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { PrismaFeedInventoryRepository } from "@/modules/feed/infrastructure/prisma-feed-repository";
import { createFeedInventory } from "@/modules/feed/application/create-feed";
import { listFeedInventoryByUser } from "@/modules/feed/application/list-feed";
import { PrismaExpenseRepository } from "@/modules/finance/infrastructure/prisma-expense-repository";
import { createExpense } from "@/modules/finance/application/create-expense";

const feedTypeEnum = z.enum(["pre_inicial", "crescimento", "postura"]);

const createBodySchema = z.object({
  name: z.string().min(1),
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

const FEED_TYPES = ["pre_inicial", "crescimento", "postura"] as const;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
  const skip = (page - 1) * limit;
  const feedType = searchParams.get("feedType") ?? undefined;
  const orderBy = (searchParams.get("orderBy") as "purchaseDate" | "name" | "createdAt") || "purchaseDate";
  const orderDirection = (searchParams.get("orderDirection") as "asc" | "desc") || "desc";

  if (feedType && !FEED_TYPES.includes(feedType as (typeof FEED_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid feedType" }, { status: 400 });
  }

  const repo = new PrismaFeedInventoryRepository();
  const result = await listFeedInventoryByUser(repo, session.user.id, {
    skip,
    take: limit,
    feedType,
    orderBy,
    orderDirection,
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
    const repo = new PrismaFeedInventoryRepository();
    const feed = await createFeedInventory(repo, {
      userId: session.user.id,
      name: parsed.data.name,
      feedType: parsed.data.feedType,
      weightKg: parsed.data.weightKg,
      price: parsed.data.price ?? null,
      consumptionPerBirdGrams: parsed.data.consumptionPerBirdGrams,
      purchaseDate: new Date(parsed.data.purchaseDate),
    });
    const priceAmount = parsed.data.price ?? null;
    if (priceAmount != null && priceAmount > 0) {
      const expenseRepo = new PrismaExpenseRepository();
      await createExpense(expenseRepo, {
        userId: session.user.id,
        amount: Number(priceAmount),
        description: `Compra de ração: ${parsed.data.name}`,
        category: "compra_de_ração",
        date: new Date(parsed.data.purchaseDate),
        feedInventoryId: feed.id,
      });
    }
    return NextResponse.json(feed);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
