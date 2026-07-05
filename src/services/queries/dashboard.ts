import { loadDashboard } from "@/services/requests/dashboard/load-dashboard";
import type { PeriodPreset } from "@/shared/period";
import { useQuery } from "@tanstack/react-query";

export const useLoadDashboard = (period: PeriodPreset = "current_month") => {
  return useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => loadDashboard(period),
    refetchOnMount: "always",
  });
};

export const DashboardQueries = {
  useLoadDashboard,
};
