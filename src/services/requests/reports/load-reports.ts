export type ChartPoint = {
  month: string;
  count?: number;
  eggs?: number;
  revenue?: number;
  profit?: number;
};

export type ReportsChartsDto = {
  chickenGrowth: ChartPoint[];
  monthlyEggs: ChartPoint[];
  monthlyRevenue: ChartPoint[];
  monthlyProfit: ChartPoint[];
};

export const loadReports = async (): Promise<ReportsChartsDto> => {
  const res = await fetch("/api/reports");
  if (!res.ok) throw new Error("Failed");
  return res.json();
};
