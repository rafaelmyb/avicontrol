"use client";

import Link from "next/link";
import { useState } from "react";
import { pt } from "@/shared/i18n/pt";
import { formatDateOnly } from "@/shared/format-date";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EditLink, DeleteButton } from "@/components/action-icon-button";
import { TablePagination } from "@/components/table-pagination";
import { BroodQueries, BroodMutations } from "@/services/queries/brood";

const BROOD_ORDER_OPTIONS: {
  value: "expectedHatchDate" | "startDate" | "createdAt";
  label: string;
}[] = [
  { value: "expectedHatchDate", label: "Data eclosão" },
  { value: "startDate", label: "Data início" },
  { value: "createdAt", label: "Data cadastro" },
];

const DEFAULT_LIMIT = 10;

export default function BroodPage() {
  const [orderBy, setOrderBy] = useState<
    "expectedHatchDate" | "startDate" | "createdAt"
  >("expectedHatchDate");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const brood = BroodQueries.useLoadBroodList({
    page,
    limit,
    orderBy,
    orderDirection,
  });
  const deleteBrood = BroodMutations.useDeleteBrood();

  const broodList = brood.data?.list ?? [];
  const total = brood.data?.total ?? 0;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 min-w-0">
          {pt.brood}
        </h1>
        <Link
          href="/brood/new"
          className="flex-shrink-0 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          {pt.addBroodCycle}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <select
          value={orderBy}
          onChange={(e) => {
            setOrderBy(
              e.target.value as "expectedHatchDate" | "startDate" | "createdAt",
            );
            setPage(1);
          }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>
            Ordenar por:
          </option>
          {BROOD_ORDER_OPTIONS.map((o) => (
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
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      {brood.isLoading ? (
        <LoadingSpinner minHeight="min-h-[calc(100vh-200px)]" />
      ) : !broodList.length ? (
        <p className="text-gray-500">Nenhum ciclo de choco.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
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
                  {pt.actualHatchedCount}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.status}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {broodList.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDateOnly(b.startDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {b.eggCount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDateOnly(b.expectedHatchDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDateOnly(b.expectedReturnToLayDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {b.actualHatchedCount ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {b.status}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-0.5">
                      <EditLink href={`/brood/${b.id}`} />
                      <DeleteButton
                        onClick={() => {
                          if (window.confirm("Excluir este ciclo de choco?"))
                            deleteBrood.mutate(b.id);
                        }}
                        disabled={deleteBrood.isPending}
                      />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <TablePagination
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
        currentPageFromApi={brood.data?.page}
      />
    </div>
  );
}
