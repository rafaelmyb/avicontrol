"use client";

import { useState } from "react";
import { pt } from "@/shared/i18n/pt";
import { formatDateOnly } from "@/shared/format-date";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EditLink, DeleteButton } from "@/components/action-icon-button";
import { TablePagination } from "@/components/table-pagination";
import { ChickenQueries, ChickenMutations } from "@/services/queries/chickens";

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
  const [statusFilter, setStatusFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [orderBy, setOrderBy] = useState<"createdAt" | "name" | "birthDate">(
    "createdAt",
  );
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const batchNamesQuery = ChickenQueries.useLoadChickenBatchNames();
  const batchNames = batchNamesQuery.data?.batchNames ?? [];

  const chickensQuery = ChickenQueries.useLoadChickens({
    page,
    limit,
    status: statusFilter || null,
    batchName: batchFilter || null,
    orderBy,
    orderDirection,
  });
  const deleteChicken = ChickenMutations.useDeleteChicken();

  if (chickensQuery.isLoading)
    return <LoadingSpinner minHeight="min-h-[calc(100vh-200px)]" />;
  if (chickensQuery.error) return <p className="text-red-600">{pt.error}</p>;

  const chickens = chickensQuery.data?.chickens ?? [];
  const total = chickensQuery.data?.total ?? 0;

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
          value={batchFilter}
          onChange={(e) => {
            setBatchFilter(e.target.value);
            setPage(1);
          }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>
            {pt.batch}
          </option>
          <option value="">Todos</option>
          {batchNames.map((name) => (
            <option key={name} value={name}>
              {name}
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
                {pt.batch}
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
                <td className="px-4 py-3 text-sm text-gray-600">
                  {c.batchName ?? "—"}
                </td>
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
      <TablePagination
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        currentPageFromApi={chickensQuery.data?.page}
      />
    </div>
  );
}
