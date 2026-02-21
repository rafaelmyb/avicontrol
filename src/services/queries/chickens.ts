import { queryClient } from "@/lib/query-client";
import { createChicken } from "@/services/requests/chickens/create-chicken";
import { deleteChicken as deleteChickenRequest } from "@/services/requests/chickens/delete-chicken";
import {
  loadChickens,
  type ChickenListOptions,
} from "@/services/requests/chickens/load-chickens";
import { loadChickenBatchNames } from "@/services/requests/chickens/load-batch-names";
import { loadChicken } from "@/services/requests/chickens/load-chicken";
import { updateChicken as updateChickenRequest } from "@/services/requests/chickens/update-chicken";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export type { ChickenListOptions } from "@/services/requests/chickens/load-chickens";

export const useLoadChickens = (options: ChickenListOptions) => {
  return useQuery({
    queryKey: ["chickens", ...Object.values(options)],
    queryFn: () => loadChickens(options),
  });
};

export const useLoadChicken = (id: string | null) => {
  return useQuery({
    queryKey: ["chickens", id],
    queryFn: () => loadChicken(id!),
    enabled: !!id,
  });
};

export const useLoadChickenBatchNames = () => {
  return useQuery({
    queryKey: ["chickens", "batch-names"],
    queryFn: loadChickenBatchNames,
  });
};

const useCreateChicken = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: createChicken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chickens"] });
      queryClient.invalidateQueries({ queryKey: ["chickens", "batch-names"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/chickens");
    },
  });
};

const useUpdateChicken = (id: string) => {
  return useMutation({
    mutationFn: (body: Parameters<typeof updateChickenRequest>[1]) =>
      updateChickenRequest(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chickens"] });
      queryClient.invalidateQueries({ queryKey: ["chickens", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

const useDeleteChicken = () => {
  return useMutation({
    mutationFn: deleteChickenRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chickens"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const ChickenQueries = {
  useLoadChickens,
  useLoadChicken,
  useLoadChickenBatchNames,
};

export const ChickenMutations = {
  useCreateChicken,
  useUpdateChicken,
  useDeleteChicken,
};
