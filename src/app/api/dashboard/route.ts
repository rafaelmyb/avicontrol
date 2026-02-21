import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrismaFeedInventoryRepository } from "@/modules/feed/infrastructure/prisma-feed-repository";
import { computeRestockByFeedTypeFromData } from "@/modules/feed/application/restock-date";
import { countChickensByFeedAgeGroup } from "@/modules/chicken/domain/services/feed-age-group";
import { getMonthlyProfitBatch } from "@/modules/finance/application/monthly-profit-batch";
import { monthlyEggProduction } from "@/modules/chicken/domain/services/egg-estimation";
import { layStartDate } from "@/modules/chicken/domain/services/layStart";
import { DEFAULT_AVERAGE_EGGS_PER_MONTH } from "@/shared/constants";

const LAYING_STATUSES = ["laying", "brooding", "recovering"] as const;

function last12Months(): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return out;
}

function endOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0, 23, 59, 59, 999);
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

const ACTIVE_STATUSES = ["chick", "pullet", "laying", "brooding", "recovering"] as const;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const now = new Date();
  const months = last12Months();
  const feedRepo = new PrismaFeedInventoryRepository();

  // Wave 1: all independent I/O in one Promise.all
  const [
    totalChickens,
    statusCounts,
    broodCycles,
    activeChickensForFeedAge,
    user,
    monthlyProfitBatchResult,
    chickenGrowthCounts,
    chickensForEggChart,
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
    Promise.all(
      months.map(({ year, month }) => {
        const end = endOfMonth(year, month);
        return prisma.chicken.count({
          where: { userId, createdAt: { lte: end } },
        });
      })
    ),
    prisma.chicken.findMany({
      where: { userId },
      select: { birthDate: true, status: true },
    }),
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

  const chickenGrowth = months.map((m, i) => ({
    month: monthLabel(m.year, m.month),
    count: chickenGrowthCounts[i],
  }));

  const monthlyEggs = months.map((m) => {
    const end = endOfMonth(m.year, m.month);
    const layingCount = chickensForEggChart.filter((c) => {
      if (!LAYING_STATUSES.includes(c.status as (typeof LAYING_STATUSES)[number])) return false;
      const start = layStartDate(c.birthDate);
      return start <= end;
    }).length;
    const eggs = Math.round(monthlyEggProduction(layingCount, DEFAULT_AVERAGE_EGGS_PER_MONTH));
    return { month: monthLabel(m.year, m.month), eggs };
  });

  const monthlyRevenue = months.map((m, i) => ({
    month: monthLabel(m.year, m.month),
    revenue: monthlyProfitBatchResult.byMonth[i].totalRevenue,
  }));

  const monthlyProfitChart = months.map((m, i) => ({
    month: monthLabel(m.year, m.month),
    profit: monthlyProfitBatchResult.byMonth[i].profit,
  }));

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
    charts: {
      chickenGrowth,
      monthlyEggs,
      monthlyRevenue,
      monthlyProfit: monthlyProfitChart,
    },
  });
}
