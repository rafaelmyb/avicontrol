"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { pt } from "@/shared/i18n/pt";

interface FeedDto {
  id: string;
  name: string;
  feedType: string;
  weightKg: number;
  price: number | null;
  consumptionPerBirdGrams: number;
  purchaseDate: string;
}

export default function FeedPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [feedType, setFeedType] = useState("");
  const [weightKg, setWeightKg] = useState(0);
  const [price, setPrice] = useState<string>("");
  const [consumptionPerBirdGrams, setConsumptionPerBirdGrams] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const { data: feedList, isLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: async () => {
      const res = await fetch("/api/feed");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<FeedDto[]>;
    },
  });

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
      setShowForm(false);
      setName("");
      setFeedType("");
      setWeightKg(0);
      setPrice("");
      setConsumptionPerBirdGrams(0);
      setPurchaseDate(new Date().toISOString().slice(0, 10));
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {pt.feedInventory}
        </h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          {pt.addFeed}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-3">{pt.addFeed}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
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
              <input
                type="text"
                value={feedType}
                onChange={(e) => setFeedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {pt.purchaseDate}
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                createFeed.mutate({
                  name,
                  feedType,
                  weightKg,
                  price: price ? Number(price) : null,
                  consumptionPerBirdGrams,
                  purchaseDate: new Date(purchaseDate).toISOString(),
                })
              }
              disabled={!name || !feedType || createFeed.isPending}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {createFeed.isPending ? pt.loading : pt.save}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {pt.cancel}
            </button>
          </div>
          {createFeed.error && (
            <p className="mt-2 text-sm text-red-600">{createFeed.error.message}</p>
          )}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">{pt.loading}</p>
      ) : !feedList?.length ? (
        <p className="text-gray-500">Nenhum estoque de ração.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.feedName}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.feedType}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.weightKg}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.consumptionPerBirdGrams}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.purchaseDate}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feedList.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{f.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{f.feedType}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{f.weightKg}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {f.consumptionPerBirdGrams} g
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(f.purchaseDate).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
