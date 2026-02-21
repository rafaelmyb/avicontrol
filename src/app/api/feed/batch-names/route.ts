import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.feedInventory.findMany({
    where: { userId: session.user.id, batchName: { not: null } },
    select: { batchName: true },
    distinct: ["batchName"],
    orderBy: { batchName: "asc" },
  });
  const batchNames = rows
    .map((r) => r.batchName)
    .filter((n): n is string => n != null);
  return NextResponse.json({ batchNames });
}
