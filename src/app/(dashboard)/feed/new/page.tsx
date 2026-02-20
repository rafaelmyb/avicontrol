"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { pt } from "@/shared/i18n/pt";
import { FEED_TYPE_OPTIONS } from "@/shared/feed-types";
import { FormPageHeader } from "@/components/form-page-header";

export default function NewFeedPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [feedType, setFeedType] = useState<string>("postura");
  const [weightKg, setWeightKg] = useState(0);
  const [price, setPrice] = useState<string>("");
  const [consumptionPerBirdGrams, setConsumptionPerBirdGrams] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const createFeed = useMutation({
    mutationFn: async (body: {
      name: string;
      feedType: string;
      weightKg: number;
      price: number | null;
      consumptionPerBirdGrams: number;
      purchaseDate: string;
    }) => {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      router.push("/feed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeed.mutate({
      name,
      feedType,
      weightKg,
      price: price ? Number(price) : null,
      consumptionPerBirdGrams,
      purchaseDate: new Date(purchaseDate).toISOString(),
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FormPageHeader
        title={pt.addFeed}
        backHref="/feed"
        backLabel={pt.feedInventory}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.feedName}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.feedType}
          </label>
          <select
            value={feedType}
            onChange={(e) => setFeedType(e.target.value)}
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
            value={weightKg || ""}
            onChange={(e) => setWeightKg(Number(e.target.value))}
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
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
            value={consumptionPerBirdGrams || ""}
            onChange={(e) =>
              setConsumptionPerBirdGrams(Number(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="min-w-0 overflow-hidden">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.purchaseDate}
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full max-w-full min-w-0 px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!name || !feedType || createFeed.isPending}
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
