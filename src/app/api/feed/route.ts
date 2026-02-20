import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { PrismaFeedInventoryRepository } from "@/modules/feed/infrastructure/prisma-feed-repository";
import { createFeedInventory } from "@/modules/feed/application/create-feed";
import { listFeedInventoryByUser } from "@/modules/feed/application/list-feed";

const createBodySchema = z.object({
  name: z.string().min(1),
  feedType: z.string().min(1),
  weightKg: z.number().min(0),
  price: z.number().nullable().optional(),
  consumptionPerBirdGrams: z.number().min(0),
  purchaseDate: z.string().min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const repo = new PrismaFeedInventoryRepository();
  const list = await listFeedInventoryByUser(repo, session.user.id);
  return NextResponse.json(list);
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
    return NextResponse.json(feed);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
