import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { PrismaFeedInventoryRepository } from "@/modules/feed/infrastructure/prisma-feed-repository";
import { updateFeedInventory } from "@/modules/feed/application/update-feed";
import { deleteFeedInventory } from "@/modules/feed/application/delete-feed";

const updateBodySchema = z.object({
  name: z.string().min(1).optional(),
  feedType: z.string().min(1).optional(),
  weightKg: z.number().min(0).optional(),
  price: z.number().nullable().optional(),
  consumptionPerBirdGrams: z.number().min(0).optional(),
  purchaseDate: z.string().optional(),
});

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
    const repo = new PrismaFeedInventoryRepository();
    const feed = await updateFeedInventory(repo, id, session.user.id, parsed.data);
    if (!feed) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(feed);
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
  const repo = new PrismaFeedInventoryRepository();
  const deleted = await deleteFeedInventory(repo, id, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
