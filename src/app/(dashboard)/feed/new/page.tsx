"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { pt } from "@/shared/i18n/pt";
import { FEED_TYPE_OPTIONS } from "@/shared/feed-types";
import { FormPageHeader } from "@/components/form-page-header";
import { FeedMutations } from "@/services/queries/feed";

type NewFeedFormValues = {
  addAsBatch: boolean;
  name: string;
  quantity: number;
  feedType: string;
  weightKg: number;
  price: string;
  consumptionPerBirdGrams: number;
  purchaseDate: string;
};

const defaultPurchaseDate = new Date().toISOString().slice(0, 10);

export default function NewFeedPage() {
  const router = useRouter();
  const createFeed = FeedMutations.useCreateFeed();

  const { register, handleSubmit, watch } = useForm<NewFeedFormValues>({
    defaultValues: {
      addAsBatch: false,
      name: "",
      quantity: 2,
      feedType: "postura",
      weightKg: 0,
      price: "",
      consumptionPerBirdGrams: 0,
      purchaseDate: defaultPurchaseDate,
    },
  });

  const addAsBatch = watch("addAsBatch");

  const onSubmit = (data: NewFeedFormValues) => {
    if (data.addAsBatch) {
      createFeed.mutate({
        batch: true,
        batchName: data.name,
        quantity: data.quantity,
        feedType: data.feedType,
        weightKg: data.weightKg,
        price: data.price ? Number(data.price) : null,
        consumptionPerBirdGrams: data.consumptionPerBirdGrams,
        purchaseDate: new Date(data.purchaseDate).toISOString(),
      });
    } else {
      createFeed.mutate({
        batch: false,
        name: data.name,
        feedType: data.feedType,
        weightKg: data.weightKg,
        price: data.price ? Number(data.price) : null,
        consumptionPerBirdGrams: data.consumptionPerBirdGrams,
        purchaseDate: new Date(data.purchaseDate).toISOString(),
      });
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FormPageHeader
        title={pt.addFeed}
        backHref="/feed"
        backLabel={pt.feedInventory}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            id="addAsBatchFeed"
            type="checkbox"
            {...register("addAsBatch")}
            className="rounded border-gray-300"
          />
          <label
            htmlFor="addAsBatchFeed"
            className="text-sm font-medium text-gray-700"
          >
            {pt.addAsBatch}
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {addAsBatch ? pt.batchName : pt.feedName}
          </label>
          <input
            type="text"
            {...register("name", { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        {addAsBatch && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {pt.quantity}
            </label>
            <input
              type="number"
              min={2}
              max={50}
              {...register("quantity", {
                valueAsNumber: true,
                min: 2,
                max: 50,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}
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
            {...register("purchaseDate", { required: true })}
            className="w-full max-w-full min-w-0 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={createFeed.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {createFeed.isPending ? pt.loading : pt.save}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {pt.cancel}
          </button>
        </div>
        {createFeed.error && (
          <p className="text-sm text-red-600">{createFeed.error.message}</p>
        )}
      </form>
    </div>
  );
}
