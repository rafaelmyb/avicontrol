"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { pt } from "@/shared/i18n/pt";
import { FormPageHeader } from "@/components/form-page-header";

export default function NewBroodPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [chickenId, setChickenId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [eggCount, setEggCount] = useState(0);

  const { data: chickens } = useQuery({
    queryKey: ["chickens", 500],
    queryFn: async () => {
      const res = await fetch("/api/chickens?limit=500&page=1");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      return json.chickens as { id: string; name: string }[];
    },
  });

  const createBrood = useMutation({
    mutationFn: async (body: {
      chickenId: string;
      startDate: string;
      eggCount: number;
    }) => {
      const res = await fetch("/api/brood", {
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
      queryClient.invalidateQueries({ queryKey: ["brood"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["chickens"] });
      router.push("/brood");
    },
  });

  const chickenOptions = chickens ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chickenId) return;
    createBrood.mutate({ chickenId, startDate, eggCount });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FormPageHeader
        title={pt.addBroodCycle}
        backHref="/brood"
        backLabel={pt.brood}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.chickens}
          </label>
          <select
            value={chickenId}
            onChange={(e) => setChickenId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Selecione</option>
            {chickenOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0 overflow-hidden">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.startDate}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full max-w-full min-w-0 px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.eggCount}
          </label>
          <input
            type="number"
            min={0}
            value={eggCount || ""}
            onChange={(e) => setEggCount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!chickenId || createBrood.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {createBrood.isPending ? pt.loading : pt.save}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {pt.cancel}
          </button>
        </div>
        {createBrood.error && (
          <p className="text-sm text-red-600">{createBrood.error.message}</p>
        )}
      </form>
    </div>
  );
}
