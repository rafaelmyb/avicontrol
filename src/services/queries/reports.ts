import { loadReports } from "@/services/requests/reports/load-reports";
import { useQuery } from "@tanstack/react-query";

export const useLoadReports = () => {
  return useQuery({
    queryKey: ["reports"],
    queryFn: loadReports,
  });
};

export const ReportsQueries = {
  useLoadReports,
};
