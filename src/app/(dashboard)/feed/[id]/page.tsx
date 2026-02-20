"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { pt } from "@/shared/i18n/pt";
import { FEED_TYPE_OPTIONS } from "@/shared/feed-types";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DeleteButton } from "@/components/action-icon-button";
import { FormPageHeader } from "@/components/form-page-header";

export default function FeedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const {
    data: feed,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feed", id],
    queryFn: async () => {
      const res = await fetch(`/api/feed/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!id,
  });

  const [name, setName] = useState("");
  const [feedType, setFeedType] = useState<string>("postura");
  const [weightKg, setWeightKg] = useState(0);
  const [price, setPrice] = useState<string>("");
  const [consumptionPerBirdGrams, setConsumptionPerBirdGrams] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState("");

  useEffect(() => {
    if (feed) {
      setName(feed.name);
      setFeedType(feed.feedType);
      setWeightKg(feed.weightKg);
      setPrice(feed.price != null ? String(feed.price) : "");
      setConsumptionPerBirdGrams(feed.consumptionPerBirdGrams);
      setPurchaseDate(feed.purchaseDate.slice(0, 10));
    }
  }, [feed]);

  const update = useMutation({
    mutationFn: async (body: {
      name: string;
      feedType: string;
      weightKg: number;
      price: number | null;
      consumptionPerBirdGrams: number;
      purchaseDate: string;
    }) => {
      const res = await fetch(`/api/feed/${id}`, {
        method: "PATCH",
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
      queryClient.invalidateQueries({ queryKey: ["feed", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/feed/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/feed");
    },
  });

  if (isLoading || !feed) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }
  if (error) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({
      name,
      feedType,
      weightKg,
      price: price === "" ? null : Number(price),
      consumptionPerBirdGrams,
      purchaseDate: purchaseDate || feed.purchaseDate.slice(0, 10),
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FormPageHeader
        title="Editar ração"
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
            onChange={(e) => setConsumptionPerBirdGrams(Number(e.target.value))}
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
          />
        </div>
        {update.error && (
          <p className="text-sm text-red-600">{update.error.message}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={update.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {update.isPending ? pt.loading : pt.save}
          </button>
          <DeleteButton
            onClick={() => {
              if (window.confirm("Excluir esta ração?"))
                deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
            className="p-2"
          />
        </div>
      </form>
    </div>
  );
}
