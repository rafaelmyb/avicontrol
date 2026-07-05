import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrismaFeedInventoryRepository } from "@/modules/feed/infrastructure/prisma-feed-repository";
import { computeRestockByFeedTypeFromData } from "@/modules/feed/application/restock-date";
import { countChickensByFeedAgeGroup } from "@/modules/chicken/domain/services/feed-age-group";
import { PrismaExpenseRepository } from "@/modules/finance/infrastructure/prisma-expense-repository";
import { PrismaRevenueRepository } from "@/modules/finance/infrastructure/prisma-revenue-repository";
import { monthlyProfit } from "@/modules/finance/domain/services/profit";
import { DEFAULT_AVERAGE_EGGS_PER_MONTH } from "@/shared/constants";
import { getDateRangeFromPreset, scaledEggProduction } from "@/shared/period";

const ACTIVE_STATUSES = ["chick", "pullet", "laying", "brooding", "recovering"] as const;

const periodSchema = z.enum(["current_month", "last_30_days", "current_year"]);

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const now = new Date();

  // Parse and validate period; default to current_month if absent or invalid.
  const { searchParams } = new URL(request.url);
  const rawPeriod = searchParams.get("period") ?? "current_month";
  const periodResult = periodSchema.safeParse(rawPeriod);
  const period = periodResult.success ? periodResult.data : "current_month";
  const { from, to } = getDateRangeFromPreset(period, now);

  const feedRepo = new PrismaFeedInventoryRepository();
  const expenseRepo = new PrismaExpenseRepository();
  const revenueRepo = new PrismaRevenueRepository();

  // All independent I/O in one Promise.all
  const [
    totalChickens,
    statusCounts,
    layingFemalesCount,
    broodCycles,
    activeChickensForFeedAge,
    user,
    totalRevenue,
    totalExpenses,
    feedRestockData,
  ] = await Promise.all([
    prisma.chicken.count({ where: { userId } }),
    prisma.chicken.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
    // Only female laying chickens produce eggs — males excluded explicitly.
    prisma.chicken.count({ where: { userId, status: "laying", sex: "female" } }),
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
    revenueRepo.sumByUserIdAndDateRange(userId, from, to),
    expenseRepo.sumByUserIdAndDateRange(userId, from, to),
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

  const eggPricePerUnit = user?.eggPricePerUnit ?? 0;

  // Egg estimation is scaled proportionally to the selected period's duration.
  // Uses 30-day "standard month" as denominator — see src/shared/period.ts for rationale.
  const estimatedMonthlyEggs = scaledEggProduction(
    layingFemalesCount,
    DEFAULT_AVERAGE_EGGS_PER_MONTH,
    from,
    to
  );
  const estimatedEggRevenue = estimatedMonthlyEggs * eggPricePerUnit;
  const monthlyRevenueWithEggs = totalRevenue + estimatedEggRevenue;
  const profit = monthlyProfit(monthlyRevenueWithEggs, totalExpenses);

  return NextResponse.json({
    totalChickens,
    layingChickens,
    broodingChickens,
    estimatedMonthlyEggs,
    eggPricePerUnit: user?.eggPricePerUnit ?? null,
    monthlyExpenses: totalExpenses,
    monthlyRevenue: totalRevenue,
    estimatedEggRevenue,
    monthlyRevenueWithEggs,
    monthlyProfit: profit,
    feedRestockAlerts,
    upcomingBroodEvents,
  });
}
