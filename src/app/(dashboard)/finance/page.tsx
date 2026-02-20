"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { pt } from "@/shared/i18n/pt";
import { formatDateOnly } from "@/shared/format-date";
import { EditLink, DeleteButton } from "@/components/action-icon-button";

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

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

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
            dashboardData
              ? {
                  estimatedMonthlyEggs: dashboardData.estimatedMonthlyEggs ?? 0,
                  eggPricePerUnit: dashboardData.eggPricePerUnit ?? 0,
                  estimatedEggRevenue: dashboardData.estimatedEggRevenue ?? 0,
                  monthlyRevenueWithEggs: dashboardData.monthlyRevenueWithEggs ?? 0,
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
const FINANCE_PAGE_LIMIT = 10;

function ExpenseSection({ start, end }: { start: string; end: string }) {
  const queryClient = useQueryClient();
  const [orderBy, setOrderBy] = useState<"date" | "amount">("date");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const { data: expenseData } = useQuery({
    queryKey: ["expenses", start, end, orderBy, orderDirection, page, FINANCE_PAGE_LIMIT],
    queryFn: async () => {
      const params = new URLSearchParams({ start, end, orderBy, orderDirection: orderDirection, page: String(page), limit: String(FINANCE_PAGE_LIMIT) });
      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ list: { id: string; amount: number; description: string | null; category: string | null; date: string }[]; total: number; page: number; limit: number }>;
    },
  });

  const expenses = expenseData?.list ?? [];
  const total = expenseData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / FINANCE_PAGE_LIMIT));

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

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
                          if (window.confirm("Excluir esta despesa?")) deleteMutation.mutate(e.id);
                        }}
                        disabled={deleteMutation.isPending}
                      />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end items-center gap-3 mt-3">
        <span className="text-sm text-gray-500">
          {total} resultado(s) · Página {expenseData?.page ?? 1} de {totalPages}
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
  const queryClient = useQueryClient();
  const [orderBy, setOrderBy] = useState<"date" | "amount">("date");
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const { data: revenueData } = useQuery({
    queryKey: ["revenue", start, end, orderBy, orderDirection, page, FINANCE_PAGE_LIMIT],
    queryFn: async () => {
      const params = new URLSearchParams({ start, end, orderBy, orderDirection: orderDirection, page: String(page), limit: String(FINANCE_PAGE_LIMIT) });
      const res = await fetch(`/api/revenue?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ list: { id: string; amount: number; description: string | null; source: string | null; date: string }[]; total: number; page: number; limit: number }>;
    },
  });

  const revenue = revenueData?.list ?? [];
  const total = revenueData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / FINANCE_PAGE_LIMIT));

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/revenue/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revenue"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

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
                          if (window.confirm("Excluir esta receita?")) deleteMutation.mutate(r.id);
                        }}
                        disabled={deleteMutation.isPending}
                      />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end items-center gap-3 mt-3">
        <span className="text-sm text-gray-500">
          {total} resultado(s) · Página {revenueData?.page ?? 1} de {totalPages}
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
