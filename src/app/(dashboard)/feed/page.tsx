"use client";

import Link from "next/link";
import { useState } from "react";
import { pt } from "@/shared/i18n/pt";
import { formatDateOnly } from "@/shared/format-date";
import { FEED_TYPE_OPTIONS, getFeedTypeLabel } from "@/shared/feed-types";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EditLink, DeleteButton } from "@/components/action-icon-button";
import { FeedRestockCard } from "@/components/feed-restock-card";
import { TablePagination } from "@/components/table-pagination";
import { DashboardQueries } from "@/services/queries/dashboard";
import { FeedQueries, FeedMutations } from "@/services/queries/feed";

const FEED_ORDER_OPTIONS: {
  value: "purchaseDate" | "name" | "createdAt";
  label: string;
}[] = [
  { value: "purchaseDate", label: "Data compra" },
  { value: "name", label: "Nome" },
  { value: "createdAt", label: "Data cadastro" },
];

const DEFAULT_LIMIT = 10;

export default function FeedPage() {
  const [feedTypeFilter, setFeedTypeFilter] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [orderBy, setOrderBy] = useState<"purchaseDate" | "name" | "createdAt">(
    "purchaseDate",
  );
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const batchNamesQuery = FeedQueries.useLoadFeedBatchNames();
  const batchNames = batchNamesQuery.data?.batchNames ?? [];

  const feed = FeedQueries.useLoadFeed({
    feedTypeFilter: feedTypeFilter || null,
    batchFilter: batchFilter || null,
    orderBy,
    orderDirection,
    page,
    limit,
  });

  const dashboardData = DashboardQueries.useLoadDashboard();
  const deleteFeed = FeedMutations.useDeleteFeed();

  const feedList = feed?.data?.list ?? [];
  const total = feed?.data?.total ?? 0;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 min-w-0">
          {pt.feedInventory}
        </h1>
        <Link
          href="/feed/new"
          className="flex-shrink-0 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800"
        >
          {pt.addFeed}
        </Link>
      </div>

      {dashboardData?.data?.feedRestockAlerts != null && (
        <div className="mb-6">
          <FeedRestockCard alerts={dashboardData.data.feedRestockAlerts} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <select
          value={feedTypeFilter}
          onChange={(e) => {
            setFeedTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>
            Tipo de ração
          </option>
          <option value="">Todos</option>
          {FEED_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
            setOrderBy(e.target.value as "purchaseDate" | "name" | "createdAt");
            setPage(1);
          }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>
            Ordenar por:
          </option>
          {FEED_ORDER_OPTIONS.map((o) => (
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

      {feed?.isLoading ? (
        <LoadingSpinner minHeight="min-h-[calc(100vh-200px)]" />
      ) : !feedList.length ? (
        <p className="text-gray-500">Nenhum estoque de ração.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.feedName}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.batch}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.feedType}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.weightKg}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.price}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.consumptionPerBirdGrams}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {pt.purchaseDate}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feedList.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{f.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {f.batchName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getFeedTypeLabel(f.feedType)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {f.weightKg}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {f.price != null ? `R$ ${Number(f.price).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {f.consumptionPerBirdGrams} g
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDateOnly(f.purchaseDate)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-0.5">
                      <EditLink href={`/feed/${f.id}`} />
                      <DeleteButton
                        onClick={() => {
                          if (window.confirm("Excluir esta ração?"))
                            deleteFeed.mutate(f.id);
                        }}
                        disabled={deleteFeed.isPending}
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
        currentPageFromApi={feed?.data?.page}
      />
    </div>
  );
}
