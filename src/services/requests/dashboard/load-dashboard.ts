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
};

export const loadDashboard = async (): Promise<DashboardData> => {
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed");
  return res.json();
};
