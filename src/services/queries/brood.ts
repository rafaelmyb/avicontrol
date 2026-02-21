import { queryClient } from "@/lib/query-client";
import { createBrood } from "@/services/requests/brood/create-brood";
import { deleteBrood as deleteBroodRequest } from "@/services/requests/brood/delete-brood";
import {
  loadBroodList,
  type BroodListOptions,
} from "@/services/requests/brood/load-brood-list";
import { loadBrood } from "@/services/requests/brood/load-brood";
import { updateBrood as updateBroodRequest } from "@/services/requests/brood/update-brood";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export type { BroodListOptions } from "@/services/requests/brood/load-brood-list";

export const useLoadBroodList = (options: BroodListOptions) => {
  return useQuery({
    queryKey: ["brood", ...Object.values(options)],
    queryFn: () => loadBroodList(options),
  });
};

export const useLoadBrood = (id: string | null) => {
  return useQuery({
    queryKey: ["brood", id],
    queryFn: () => loadBrood(id!),
    enabled: !!id,
  });
};

const useCreateBrood = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: createBrood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brood"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["chickens"] });
      router.push("/brood");
    },
  });
};

const useUpdateBrood = (id: string) => {
  return useMutation({
    mutationFn: (body: Parameters<typeof updateBroodRequest>[1]) =>
      updateBroodRequest(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brood"] });
      queryClient.invalidateQueries({ queryKey: ["brood", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

const useDeleteBrood = () => {
  return useMutation({
    mutationFn: deleteBroodRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brood"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["chickens"] });
    },
  });
};

export const BroodQueries = {
  useLoadBroodList,
  useLoadBrood,
};

export const BroodMutations = {
  useCreateBrood,
  useUpdateBrood,
  useDeleteBrood,
};
