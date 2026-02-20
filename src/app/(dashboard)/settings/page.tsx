"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { pt } from "@/shared/i18n/pt";
import { LoadingSpinner } from "@/components/loading-spinner";

interface SettingsData {
  eggPricePerUnit: number | null;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [eggPrice, setEggPrice] = useState<string>("");

  const { data, isLoading, error } = useQuery<SettingsData>({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  useEffect(() => {
    if (data?.eggPricePerUnit != null) {
      setEggPrice(String(data.eggPricePerUnit));
    } else {
      setEggPrice("");
    }
  }, [data?.eggPricePerUnit]);

  const updateSettings = useMutation({
    mutationFn: async (body: { eggPricePerUnit: number | null }) => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = eggPrice.trim() === "" ? null : Number(eggPrice);
    if (value !== null && (Number.isNaN(value) || value < 0)) return;
    updateSettings.mutate({ eggPricePerUnit: value });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-red-600">{pt.error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {pt.settings}
      </h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div>
          <label
            htmlFor="eggPricePerUnit"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {pt.eggPricePerUnit}
          </label>
          <input
            id="eggPricePerUnit"
            type="number"
            step={0.01}
            min={0}
            value={eggPrice}
            onChange={(e) => setEggPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="0,00"
          />
          <p className="mt-1 text-xs text-gray-500">{pt.eggPricePerUnitHelp}</p>
        </div>
        <button
          type="submit"
          disabled={updateSettings.isPending}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {updateSettings.isPending ? pt.loading : pt.save}
        </button>
      </form>
    </div>
  );
}
