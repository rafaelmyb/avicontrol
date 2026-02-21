"use client";

import Link from "next/link";
import { useState } from "react";
import { pt } from "@/shared/i18n/pt";
import { formatDateOnly } from "@/shared/format-date";
import { EditLink, DeleteButton } from "@/components/action-icon-button";
import { TablePagination } from "@/components/table-pagination";
import { DashboardQueries } from "@/services/queries/dashboard";
import { ExpenseQueries, ExpenseMutations } from "@/services/queries/expenses";
import { RevenueQueries, RevenueMutations } from "@/services/queries/revenue";

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

const expenseCategoryLabel: Record<string, string> = {
  compra_de_galinha: "Compra de galinha",
  compra_de_ração: "Compra de ração",
};
function getExpenseCategoryLabel(category: string | null): string {
  if (!category) return "—";
  return expenseCategoryLabel[category] ?? category;
}

export default function FinancePage() {
  const [tab, setTab] = useState<"expenses" | "revenue">("expenses");
  const { start, end } = getMonthRange();

  const dashboardData = DashboardQueries.useLoadDashboard();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {pt.finance}
      </h1>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("expenses")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            tab === "expenses"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {pt.expenses}
        </button>
        <button
          type="button"
          onClick={() => setTab("revenue")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            tab === "revenue"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {pt.revenue}
        </button>
      </div>

      {tab === "expenses" && (
        <ExpenseSection start={start} end={end} />
      )}
      {tab === "revenue" && (
        <RevenueSection
          start={start}
          end={end}
          eggRevenueSummary={
            dashboardData?.data
              ? {
                  estimatedMonthlyEggs: dashboardData.data.estimatedMonthlyEggs ?? 0,
                  eggPricePerUnit: dashboardData.data.eggPricePerUnit ?? 0,
                  estimatedEggRevenue: dashboardData.data.estimatedEggRevenue ?? 0,
                  monthlyRevenueWithEggs: dashboardData.data.monthlyRevenueWithEggs ?? 0,
                }
              : null
          }
        />
      )}
    </div>
  );
}

const EXPENSE_ORDER_OPTIONS: { value: "date" | "amount"; label: string }[] = [
  { value: "date", label: "Data" },
  { value: "amount", label: "Valor" },
];
const DEFAULT_FINANCE_LIMIT = 10;

function ExpenseSection({ start, end }: { start: string; end: string }) {
  const [orderBy, setOrderBy] = useState<"date" | "amount">("date");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_FINANCE_LIMIT);

  const expenseData = ExpenseQueries.useLoadExpenses({
    start,
    end,
    page,
    limit,
    orderBy,
    orderDirection,
  });
  const deleteExpense = ExpenseMutations.useDeleteExpense();

  const expenses = expenseData.data?.list ?? [];
  const total = expenseData.data?.total ?? 0;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-lg font-medium text-gray-900 min-w-0">{pt.expenses}</h2>
        <Link
          href="/finance/expenses/new"
          className="flex-shrink-0 px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
        >
          {pt.addExpense}
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <select
          value={orderBy}
          onChange={(e) => { setOrderBy(e.target.value as "date" | "amount"); setPage(1); }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>Ordenar por:</option>
          {EXPENSE_ORDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={orderDirection}
          onChange={(e) => { setOrderDirection(e.target.value as "asc" | "desc"); setPage(1); }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>Direção:</option>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
      {!expenses.length ? (
        <p className="text-gray-500">Nenhuma despesa neste período.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.date}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.amount}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.description}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.category}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDateOnly(e.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    R$ {Number(e.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{e.description ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getExpenseCategoryLabel(e.category)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-0.5">
                      <EditLink href={`/finance/expenses/${e.id}`} />
                      <DeleteButton
                        onClick={() => {
                          if (window.confirm("Excluir esta despesa?")) deleteExpense.mutate(e.id);
                        }}
                        disabled={deleteExpense.isPending}
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
        currentPageFromApi={expenseData.data?.page}
      />
    </div>
  );
}

const REVENUE_ORDER_OPTIONS: { value: "date" | "amount"; label: string }[] = [
  { value: "date", label: "Data" },
  { value: "amount", label: "Valor" },
];

function RevenueSection({
  start,
  end,
  eggRevenueSummary,
}: {
  start: string;
  end: string;
  eggRevenueSummary: {
    estimatedMonthlyEggs: number;
    eggPricePerUnit: number;
    estimatedEggRevenue: number;
    monthlyRevenueWithEggs: number;
  } | null;
}) {
  const [orderBy, setOrderBy] = useState<"date" | "amount">("date");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_FINANCE_LIMIT);

  const revenueData = RevenueQueries.useLoadRevenueList({
    start,
    end,
    page,
    limit,
    orderBy,
    orderDirection,
  });
  const deleteRevenue = RevenueMutations.useDeleteRevenue();

  const revenue = revenueData.data?.list ?? [];
  const total = revenueData.data?.total ?? 0;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-lg font-medium text-gray-900 min-w-0">{pt.revenue}</h2>
        <Link
          href="/finance/revenue/new"
          className="flex-shrink-0 px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
        >
          {pt.addRevenue}
        </Link>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <select
          value={orderBy}
          onChange={(e) => { setOrderBy(e.target.value as "date" | "amount"); setPage(1); }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>Ordenar por:</option>
          {REVENUE_ORDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={orderDirection}
          onChange={(e) => { setOrderDirection(e.target.value as "asc" | "desc"); setPage(1); }}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        >
          <option value="" disabled>Direção:</option>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
      {eggRevenueSummary && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 space-y-1">
          {eggRevenueSummary.estimatedMonthlyEggs > 0 && eggRevenueSummary.eggPricePerUnit > 0 && (
            <p>
              {pt.estimatedEggRevenue}: {eggRevenueSummary.estimatedMonthlyEggs} ovos × R$ {eggRevenueSummary.eggPricePerUnit.toFixed(2)} = R$ {eggRevenueSummary.estimatedEggRevenue.toFixed(2)}
            </p>
          )}
          <p className="font-medium">
            {pt.totalRevenueWithEggs}: R$ {eggRevenueSummary.monthlyRevenueWithEggs.toFixed(2)}
          </p>
        </div>
      )}
      {!revenue.length ? (
        <p className="text-gray-500">Nenhuma receita neste período.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.date}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.amount}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.description}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.source}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {revenue.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDateOnly(r.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    R$ {Number(r.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.description ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.source ?? "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-0.5">
                      <EditLink href={`/finance/revenue/${r.id}`} />
                      <DeleteButton
                        onClick={() => {
                          if (window.confirm("Excluir esta receita?")) deleteRevenue.mutate(r.id);
                        }}
                        disabled={deleteRevenue.isPending}
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
        currentPageFromApi={revenueData.data?.page}
      />
    </div>
  );
}
