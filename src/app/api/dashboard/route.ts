import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrismaFeedInventoryRepository } from "@/modules/feed/infrastructure/prisma-feed-repository";
import { computeRestockByFeedType } from "@/modules/feed/application/restock-date";
import { countChickensByFeedAgeGroup } from "@/modules/chicken/domain/services/feed-age-group";
import { PrismaExpenseRepository } from "@/modules/finance/infrastructure/prisma-expense-repository";
import { PrismaRevenueRepository } from "@/modules/finance/infrastructure/prisma-revenue-repository";
import { getMonthlyProfit } from "@/modules/finance/application/monthly-profit";
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

  const [totalChickens, statusCounts] = await Promise.all([
    prisma.chicken.count({ where: { userId } }),
    prisma.chicken.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
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

  const activeChickens = await prisma.chicken.findMany({
    where: { userId, status: { in: [...ACTIVE_STATUSES] } },
    select: { birthDate: true },
  });
  const feedAgeCounts = countChickensByFeedAgeGroup(activeChickens, now);
  const feedRepo = new PrismaFeedInventoryRepository();
  const feedRestockAlerts = await computeRestockByFeedType(
    feedRepo,
    userId,
    feedAgeCounts
  );

  const nowDate = new Date();
  const [user, monthlyResult] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { eggPricePerUnit: true },
    }),
    (async () => {
      const expenseRepo = new PrismaExpenseRepository();
      const revenueRepo = new PrismaRevenueRepository();
      return getMonthlyProfit(
        expenseRepo,
        revenueRepo,
        userId,
        nowDate.getFullYear(),
        nowDate.getMonth() + 1
      );
    })(),
  ]);

  const estimatedMonthlyEggs = monthlyEggProduction(
    layingChickens,
    DEFAULT_AVERAGE_EGGS_PER_MONTH
  );
  const eggPricePerUnit = user?.eggPricePerUnit ?? 0;
  const estimatedEggRevenue = estimatedMonthlyEggs * eggPricePerUnit;
  const monthlyRevenueWithEggs = monthlyResult.totalRevenue + estimatedEggRevenue;
  const monthlyProfit =
    monthlyRevenueWithEggs - monthlyResult.totalExpenses;

  // Chart data: last 12 months
  const months = last12Months();
  const [allChickensForCharts, monthlyProfitResults] = await Promise.all([
    prisma.chicken.findMany({
      where: { userId },
      select: { createdAt: true, birthDate: true, status: true },
    }),
    (async () => {
      const expenseRepo = new PrismaExpenseRepository();
      const revenueRepo = new PrismaRevenueRepository();
      return Promise.all(
        months.map(({ year, month }) =>
          getMonthlyProfit(expenseRepo, revenueRepo, userId, year, month)
        )
      );
    })(),
  ]);

  const chickenGrowth = months.map(({ year, month }) => {
    const end = endOfMonth(year, month);
    const count = allChickensForCharts.filter((c) => c.createdAt <= end).length;
    return { month: monthLabel(year, month), count };
  });

  const monthlyEggs = months.map(({ year, month }) => {
    const end = endOfMonth(year, month);
    const layingCount = allChickensForCharts.filter((c) => {
      if (!LAYING_STATUSES.includes(c.status as (typeof LAYING_STATUSES)[number])) return false;
      const start = layStartDate(c.birthDate);
      return start <= end;
    }).length;
    const eggs = Math.round(monthlyEggProduction(layingCount, DEFAULT_AVERAGE_EGGS_PER_MONTH));
    return { month: monthLabel(year, month), eggs };
  });

  const monthlyRevenue = months.map((m, i) => ({
    month: monthLabel(m.year, m.month),
    revenue: monthlyProfitResults[i].totalRevenue,
  }));

  const monthlyProfitChart = months.map((m, i) => ({
    month: monthLabel(m.year, m.month),
    profit: monthlyProfitResults[i].profit,
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
