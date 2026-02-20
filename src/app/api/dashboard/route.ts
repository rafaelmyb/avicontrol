import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrismaFeedInventoryRepository } from "@/modules/feed/infrastructure/prisma-feed-repository";
import { computeNextRestock } from "@/modules/feed/application/restock-date";
import { PrismaExpenseRepository } from "@/modules/finance/infrastructure/prisma-expense-repository";
import { PrismaRevenueRepository } from "@/modules/finance/infrastructure/prisma-revenue-repository";
import { getMonthlyProfit } from "@/modules/finance/application/monthly-profit";
import { monthlyEggProduction } from "@/modules/chicken/domain/services/egg-estimation";
import { DEFAULT_AVERAGE_EGGS_PER_MONTH } from "@/shared/constants";

const ACTIVE_STATUSES = ["chick", "pullet", "laying", "brooding", "recovering"] as const;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [totalChickens, statusCounts, activeBirdCountResult] = await Promise.all([
    prisma.chicken.count({ where: { userId } }),
    prisma.chicken.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.chicken.count({
      where: { userId, status: { in: [...ACTIVE_STATUSES] } },
    }),
  ]);

  const statusMap = Object.fromEntries(
    statusCounts.map((s: { status: string; _count: number }) => [s.status, s._count])
  ) as Record<string, number>;
  const layingChickens = statusMap.laying ?? 0;
  const broodingChickens = statusMap.brooding ?? 0;

  const now = new Date();
  const broodCycles = await prisma.broodCycle.findMany({
    where: {
      chicken: { userId },
      expectedHatchDate: { gte: now },
      status: "active",
    },
    include: { chicken: true },
    orderBy: { expectedHatchDate: "asc" },
    take: 10,
  });
  const upcomingBroodEvents = broodCycles.map((b) => ({
    id: b.id,
    chickenName: b.chicken.name,
    date: b.expectedHatchDate.toISOString(),
  }));

  const feedRepo = new PrismaFeedInventoryRepository();
  const nextRestock = await computeNextRestock(
    feedRepo,
    userId,
    activeBirdCountResult
  );
  const feedRestockAlert =
    nextRestock && nextRestock.estimatedRestockDate >= now
      ? {
          name: nextRestock.name,
          date: nextRestock.estimatedRestockDate.toISOString(),
        }
      : null;

  const nowDate = new Date();
  const expenseRepo = new PrismaExpenseRepository();
  const revenueRepo = new PrismaRevenueRepository();
  const monthlyResult = await getMonthlyProfit(
    expenseRepo,
    revenueRepo,
    userId,
    nowDate.getFullYear(),
    nowDate.getMonth() + 1
  );

  const estimatedMonthlyEggs = monthlyEggProduction(
    layingChickens,
    DEFAULT_AVERAGE_EGGS_PER_MONTH
  );

  return NextResponse.json({
    totalChickens,
    layingChickens,
    broodingChickens,
    estimatedMonthlyEggs,
    monthlyProfit: monthlyResult.profit,
    feedRestockAlert,
    upcomingBroodEvents,
  });
}
