import { prisma } from "@/lib/prisma";
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
  return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
}

export type ChartPoint = {
  month: string;
  count?: number;
  eggs?: number;
  revenue?: number;
  profit?: number;
};

export type ChartsData = {
  chickenGrowth: ChartPoint[];
  monthlyEggs: ChartPoint[];
  monthlyRevenue: ChartPoint[];
  monthlyProfit: ChartPoint[];
};

export async function getChartsData(userId: string): Promise<ChartsData> {
  const now = new Date();
  const months = last12Months();

  const [monthlyProfitBatchResult, chickenGrowthCounts, chickensForEggChart] =
    await Promise.all([
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
    ]);

  const chickenGrowth = months.map((m, i) => ({
    month: monthLabel(m.year, m.month),
    count: chickenGrowthCounts[i],
  }));

  const monthlyEggs = months.map((m) => {
    const end = endOfMonth(m.year, m.month);
    const layingCount = chickensForEggChart.filter((c) => {
      if (!LAYING_STATUSES.includes(c.status as (typeof LAYING_STATUSES)[number]))
        return false;
      const start = layStartDate(c.birthDate);
      return start <= end;
    }).length;
    const eggs = Math.round(
      monthlyEggProduction(layingCount, DEFAULT_AVERAGE_EGGS_PER_MONTH)
    );
    return { month: monthLabel(m.year, m.month), eggs };
  });

  const monthlyRevenue = months.map((m, i) => ({
    month: monthLabel(m.year, m.month),
    revenue: monthlyProfitBatchResult.byMonth[i].totalRevenue,
  }));

  const monthlyProfit = months.map((m, i) => ({
    month: monthLabel(m.year, m.month),
    profit: monthlyProfitBatchResult.byMonth[i].profit,
  }));

  return {
    chickenGrowth,
    monthlyEggs,
    monthlyRevenue,
    monthlyProfit,
  };
}
