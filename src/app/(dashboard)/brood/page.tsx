"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { pt } from "@/shared/i18n/pt";

interface BroodCycleDto {
  id: string;
  chickenId: string;
  startDate: string;
  eggCount: number;
  expectedHatchDate: string;
  expectedReturnToLayDate: string;
  actualHatchedCount: number | null;
  status: string;
}

interface ChickenOption {
  id: string;
  name: string;
}

export default function BroodPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [chickenId, setChickenId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [eggCount, setEggCount] = useState(0);

  const { data: chickens } = useQuery({
    queryKey: ["chickens"],
    queryFn: async () => {
      const res = await fetch("/api/chickens?take=500");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      return json.chickens as { id: string; name: string }[];
    },
  });

  const { data: broodList, isLoading } = useQuery({
    queryKey: ["brood"],
    queryFn: async () => {
      const res = await fetch("/api/brood");
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<BroodCycleDto[]>;
    },
  });

  const createBrood = useMutation({
    mutationFn: async (body: { chickenId: string; startDate: string; eggCount: number }) => {
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
      setShowForm(false);
      setChickenId("");
      setStartDate(new Date().toISOString().slice(0, 10));
      setEggCount(0);
    },
  });

  const chickenOptions: ChickenOption[] = chickens ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{pt.brood}</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          {pt.addBroodCycle}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-3">{pt.addBroodCycle}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {pt.chickens}
              </label>
              <select
                value={chickenId}
                onChange={(e) => setChickenId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Selecione</option>
                {chickenOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {pt.startDate}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {pt.eggCount}
              </label>
              <input
                type="number"
                min={0}
                value={eggCount}
                onChange={(e) => setEggCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                createBrood.mutate({
                  chickenId,
                  startDate: new Date(startDate).toISOString(),
                  eggCount,
                })
              }
              disabled={!chickenId || createBrood.isPending}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {createBrood.isPending ? pt.loading : pt.save}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {pt.cancel}
            </button>
          </div>
          {createBrood.error && (
            <p className="mt-2 text-sm text-red-600">{createBrood.error.message}</p>
          )}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">{pt.loading}</p>
      ) : !broodList?.length ? (
        <p className="text-gray-500">Nenhum ciclo de ninhada.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.startDate}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.eggCount}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.expectedHatchDate}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.expectedReturnToLayDate}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.status}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {broodList.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(b.startDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.eggCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(b.expectedHatchDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(b.expectedReturnToLayDate).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
