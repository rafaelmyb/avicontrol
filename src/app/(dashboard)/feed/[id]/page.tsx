"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { pt } from "@/shared/i18n/pt";
import { FEED_TYPE_OPTIONS } from "@/shared/feed-types";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DeleteButton } from "@/components/action-icon-button";
import { FormPageHeader } from "@/components/form-page-header";
import { FeedQueries, FeedMutations } from "@/services/queries/feed";

type FeedFormValues = {
  name: string;
  feedType: string;
  weightKg: number;
  price: string;
  consumptionPerBirdGrams: number;
  purchaseDate: string;
};

export default function FeedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const feedQuery = FeedQueries.useLoadFeedById(id);
  const feed = feedQuery.data;
  const updateFeed = FeedMutations.useUpdateFeed(id);
  const deleteFeed = FeedMutations.useDeleteFeed();

  const { register, handleSubmit, reset } = useForm<FeedFormValues>({
    defaultValues: {
      name: "",
      feedType: "postura",
      weightKg: 0,
      price: "",
      consumptionPerBirdGrams: 0,
      purchaseDate: "",
    },
  });

  useEffect(() => {
    if (feed) {
      reset({
        name: feed.name,
        feedType: feed.feedType,
        weightKg: feed.weightKg,
        price: feed.price != null ? String(feed.price) : "",
        consumptionPerBirdGrams: feed.consumptionPerBirdGrams,
        purchaseDate: feed.purchaseDate.slice(0, 10),
      });
    }
  }, [feed, reset]);

  const onSubmit = (data: FeedFormValues) => {
    updateFeed.mutate({
      name: data.name,
      feedType: data.feedType,
      weightKg: data.weightKg,
      price: data.price === "" ? null : Number(data.price),
      consumptionPerBirdGrams: data.consumptionPerBirdGrams,
      purchaseDate: data.purchaseDate || feed!.purchaseDate.slice(0, 10),
    });
  };

  const onDelete = () => {
    if (window.confirm("Excluir esta ração?"))
      deleteFeed.mutate(id, { onSuccess: () => router.push("/feed") });
  };

  if (feedQuery.isLoading || !feed) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }
  if (feedQuery.error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{pt.error}</p>
        <Link
          href="/feed"
          className="text-gray-900 hover:underline mt-2 inline-block"
        >
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FormPageHeader
        title="Editar ração"
        backHref="/feed"
        backLabel={pt.feedInventory}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.feedName}
          </label>
          <input
            type="text"
            {...register("name")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.feedType}
          </label>
          <select
            {...register("feedType")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {FEED_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.weightKg}
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            {...register("weightKg", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.price}
          </label>
          <input
            type="number"
            min={0}
            step={0.01}
            {...register("price")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.consumptionPerBirdGrams}
          </label>
          <input
            type="number"
            min={0}
            {...register("consumptionPerBirdGrams", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="min-w-0 overflow-hidden">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.purchaseDate}
          </label>
          <input
            type="date"
            {...register("purchaseDate")}
            className="w-full max-w-full min-w-0 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        {updateFeed.error && (
          <p className="text-sm text-red-600">{updateFeed.error.message}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={updateFeed.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {updateFeed.isPending ? pt.loading : pt.save}
          </button>
          <DeleteButton
            onClick={onDelete}
            disabled={deleteFeed.isPending}
            className="p-2"
          />
        </div>
      </form>
    </div>
  );
}
