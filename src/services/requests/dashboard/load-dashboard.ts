export type ChartPoint = {
  month: string;
  count?: number;
  eggs?: number;
  revenue?: number;
  profit?: number;
};

export type DashboardCharts = {
  chickenGrowth: ChartPoint[];
  monthlyEggs: ChartPoint[];
  monthlyRevenue: ChartPoint[];
  monthlyProfit: ChartPoint[];
};

export type FeedRestockAlertItem = {
  feedType: string;
  label: string;
  date: string | null;
};

export type DashboardData = {
  totalChickens: number;
  layingChickens: number;
  broodingChickens: number;
  estimatedMonthlyEggs: number | null;
  eggPricePerUnit: number | null;
  monthlyExpenses: number;
  monthlyRevenue: number;
  estimatedEggRevenue: number;
  monthlyRevenueWithEggs: number;
  monthlyProfit: number;
  feedRestockAlerts: FeedRestockAlertItem[];
  upcomingBroodEvents: { id: string; chickenName: string; date: string }[];
  charts?: DashboardCharts;
};

export const loadDashboard = async (): Promise<DashboardData> => {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed");
  return res.json();
};
