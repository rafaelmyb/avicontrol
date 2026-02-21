import { queryClient } from "@/lib/query-client";
import { createFeed } from "@/services/requests/feed/create-feed";
import { deleteFeed as deleteFeedRequest } from "@/services/requests/feed/delete-feed";
import {
  loadFeed,
  type FeedListOptions,
} from "@/services/requests/feed/load-feed";
import { loadFeedBatchNames } from "@/services/requests/feed/load-batch-names";
import { loadFeedById } from "@/services/requests/feed/load-feed-by-id";
import { updateFeed as updateFeedRequest } from "@/services/requests/feed/update-feed";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export type { FeedListOptions } from "@/services/requests/feed/load-feed";

export const useLoadFeed = (options: FeedListOptions) => {
  return useQuery({
    queryKey: ["feed", ...Object.values(options)],
    queryFn: () => loadFeed(options),
  });
};

export const useLoadFeedById = (id: string | null) => {
  return useQuery({
    queryKey: ["feed", id],
    queryFn: () => loadFeedById(id!),
    enabled: !!id,
  });
};

export const useLoadFeedBatchNames = () => {
  return useQuery({
    queryKey: ["feed", "batch-names"],
    queryFn: loadFeedBatchNames,
  });
};

const useCreateFeed = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: createFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed", "batch-names"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      router.push("/feed");
    },
  });
};

const useUpdateFeed = (id: string) => {
  return useMutation({
    mutationFn: (body: Parameters<typeof updateFeedRequest>[1]) =>
      updateFeedRequest(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

const useDeleteFeed = () => {
  return useMutation({
    mutationFn: deleteFeedRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const FeedQueries = {
  useLoadFeed,
  useLoadFeedById,
  useLoadFeedBatchNames,
};

export const FeedMutations = {
  useCreateFeed,
  useUpdateFeed,
  useDeleteFeed,
};
