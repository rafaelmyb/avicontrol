import { queryClient } from "@/lib/query-client";
import { createRevenue } from "@/services/requests/revenue/create-revenue";
import { deleteRevenue as deleteRevenueRequest } from "@/services/requests/revenue/delete-revenue";
import {
  loadRevenueList,
  type RevenueListOptions,
} from "@/services/requests/revenue/load-revenue-list";
import { loadRevenue } from "@/services/requests/revenue/load-revenue";
import { updateRevenue as updateRevenueRequest } from "@/services/requests/revenue/update-revenue";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export type { RevenueListOptions } from "@/services/requests/revenue/load-revenue-list";

export const useLoadRevenueList = (options: RevenueListOptions) => {
  return useQuery({
    queryKey: ["revenue", ...Object.values(options)],
    queryFn: () => loadRevenueList(options),
    enabled: !!options.start && !!options.end,
  });
};

export const useLoadRevenue = (id: string | null) => {
  return useQuery({
    queryKey: ["revenue", id],
    queryFn: () => loadRevenue(id!),
    enabled: !!id,
  });
};

const useCreateRevenue = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: createRevenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/finance");
    },
  });
};

const useUpdateRevenue = (id: string) => {
  return useMutation({
    mutationFn: (body: Parameters<typeof updateRevenueRequest>[1]) =>
      updateRevenueRequest(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      queryClient.invalidateQueries({ queryKey: ["revenue", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

const useDeleteRevenue = () => {
  return useMutation({
    mutationFn: deleteRevenueRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const RevenueQueries = {
  useLoadRevenueList,
  useLoadRevenue,
};

export const RevenueMutations = {
  useCreateRevenue,
  useUpdateRevenue,
  useDeleteRevenue,
};
