import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrismaFeedInventoryRepository } from "@/modules/feed/infrastructure/prisma-feed-repository";
import { computeRestockByFeedTypeFromData } from "@/modules/feed/application/restock-date";
import { countChickensByFeedAgeGroup } from "@/modules/chicken/domain/services/feed-age-group";
import { getMonthlyProfitBatch } from "@/modules/finance/application/monthly-profit-batch";
import { monthlyEggProduction } from "@/modules/chicken/domain/services/egg-estimation";
import { DEFAULT_AVERAGE_EGGS_PER_MONTH } from "@/shared/constants";

const ACTIVE_STATUSES = ["chick", "pullet", "laying", "brooding", "recovering"] as const;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const now = new Date();
  const feedRepo = new PrismaFeedInventoryRepository();

  // Wave 1: all independent I/O in one Promise.all
  const [
    totalChickens,
    statusCounts,
    broodCycles,
    activeChickensForFeedAge,
    user,
    monthlyProfitBatchResult,
    feedRestockData,
  ] = await Promise.all([
    prisma.chicken.count({ where: { userId } }),
    prisma.chicken.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    prisma.broodCycle.findMany({
      where: {
        chicken: { userId },
        expectedHatchDate: { gte: now },
        status: "active",
      },
      select: {
        id: true,
        expectedHatchDate: true,
        chicken: { select: { name: true } },
      },
      orderBy: { expectedHatchDate: "asc" },
      take: 10,
    }),
    prisma.chicken.findMany({
      where: { userId, status: { in: [...ACTIVE_STATUSES] } },
      select: { birthDate: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { eggPricePerUnit: true },
    }),
    getMonthlyProfitBatch(userId, now),
    feedRepo.findRestockDataByUserId(userId),
  ]);

  // Derived from wave 1 (no extra DB calls)
  const statusMap = Object.fromEntries(
    statusCounts.map((s: { status: string; _count: number }) => [s.status, s._count])
  ) as Record<string, number>;
  const layingChickens = statusMap.laying ?? 0;
  const broodingChickens = statusMap.brooding ?? 0;

  const upcomingBroodEvents = broodCycles.map((b) => ({
    id: b.id,
    chickenName: b.chicken.name,
    date: b.expectedHatchDate.toISOString(),
  }));

  const feedAgeCounts = countChickensByFeedAgeGroup(activeChickensForFeedAge, now);
  const feedRestockAlerts = computeRestockByFeedTypeFromData(feedRestockData, feedAgeCounts);

  const monthlyResult = monthlyProfitBatchResult.currentMonth;
  const eggPricePerUnit = user?.eggPricePerUnit ?? 0;
  const estimatedMonthlyEggs = monthlyEggProduction(
    layingChickens,
    DEFAULT_AVERAGE_EGGS_PER_MONTH
  );
  const estimatedEggRevenue = estimatedMonthlyEggs * eggPricePerUnit;
  const monthlyRevenueWithEggs = monthlyResult.totalRevenue + estimatedEggRevenue;
  const monthlyProfit = monthlyRevenueWithEggs - monthlyResult.totalExpenses;

  return NextResponse.json({
    totalChickens,
    layingChickens,
    broodingChickens,
    estimatedMonthlyEggs,
    eggPricePerUnit: user?.eggPricePerUnit ?? null,
    monthlyExpenses: monthlyResult.totalExpenses,
    monthlyRevenue: monthlyResult.totalRevenue,
    estimatedEggRevenue,
    monthlyRevenueWithEggs,
    monthlyProfit,
    feedRestockAlerts,
    upcomingBroodEvents,
  });
}
