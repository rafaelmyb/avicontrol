"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pt } from "@/shared/i18n/pt";
import { formatDateOnly } from "@/shared/format-date";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EditLink, DeleteButton } from "@/components/action-icon-button";

interface ChickenDto {
  id: string;
  name: string;
  breed: string;
  birthDate: string;
  status: string;
  source: string;
  purchasePrice: number | null;
  ageInDays: number;
  layStartDate: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = [
  "",
  "chick",
  "pullet",
  "laying",
  "brooding",
  "recovering",
  "retired",
  "sold",
  "deceased",
] as const;

const statusLabel: Record<string, string> = {
  chick: pt.chick,
  pullet: pt.pullet,
  laying: pt.laying,
  brooding: pt.brooding,
  recovering: pt.recovering,
  retired: pt.retired,
  sold: pt.sold,
  deceased: pt.deceased,
};

const sourceLabel: Record<string, string> = {
  purchased: pt.purchased,
  hatched: pt.hatched,
};

const ORDER_BY_OPTIONS: {
  value: "createdAt" | "name" | "birthDate";
  label: string;
}[] = [
  { value: "createdAt", label: "Data" },
  { value: "name", label: "Nome" },
  { value: "birthDate", label: "Nascimento" },
];

const DEFAULT_LIMIT = 10;

export function ChickenList() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [orderBy, setOrderBy] = useState<"createdAt" | "name" | "birthDate">(
    "createdAt",
  );
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = DEFAULT_LIMIT;

  const deleteChicken = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/chickens/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chickens"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "chickens",
      statusFilter || null,
      orderBy,
      orderDirection,
      page,
      limit,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("orderBy", orderBy);
      params.set("orderDirection", orderDirection);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/chickens?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<{
        chickens: ChickenDto[];
        total: number;
        page: number;
        limit: number;
      }>;
    },
  });

  if (isLoading)
    return <LoadingSpinner minHeight="min-h-[calc(100vh-200px)]" />;
  if (error) return <p className="text-red-600">{pt.error}</p>;

  const chickens = data?.chickens ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>
            Status
          </option>
          <option value="">Todos</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
        <select
          value={orderBy}
          onChange={(e) => {
            setOrderBy(e.target.value as "createdAt" | "name" | "birthDate");
            setPage(1);
          }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>
            Ordenar por:
          </option>
          {ORDER_BY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={orderDirection}
          onChange={(e) => {
            setOrderDirection(e.target.value as "asc" | "desc");
            setPage(1);
          }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>
            Direção:
          </option>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {pt.chickenName}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {pt.breed}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {pt.birthDate}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {pt.status}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {pt.sourceLabel}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {pt.price}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {pt.age}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {chickens.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.breed}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDateOnly(c.birthDate)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {statusLabel[c.status] ?? c.status}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {sourceLabel[c.source] ?? c.source}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {c.purchasePrice != null
                    ? `R$ ${Number(c.purchasePrice).toFixed(2)}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {pt.ageDays(c.ageInDays)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-0.5">
                    <EditLink href={`/chickens/${c.id}`} />
                    <DeleteButton
                      onClick={() => {
                        if (window.confirm("Excluir esta galinha?"))
                          deleteChicken.mutate(c.id);
                      }}
                      disabled={deleteChicken.isPending}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end items-center gap-3 mt-3">
        <span className="text-sm text-gray-500">
          {total} resultado(s) · Página {data?.page ?? 1} de {totalPages}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
