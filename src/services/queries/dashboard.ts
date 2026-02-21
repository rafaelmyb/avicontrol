import { loadDashboard } from "@/services/requests/dashboard/load-dashboard";
import { useQuery } from "@tanstack/react-query";

export const useLoadDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: loadDashboard,
    refetchOnMount: "always",
  });
};

export const DashboardQueries = {
  useLoadDashboard,
};
