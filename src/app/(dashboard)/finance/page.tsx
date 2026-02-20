"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { pt } from "@/shared/i18n/pt";

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export default function FinancePage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"expenses" | "revenue">("expenses");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const { start, end } = getMonthRange();

  const { data: expenses } = useQuery({
    queryKey: ["expenses", start, end],
    queryFn: async () => {
      const res = await fetch(`/api/expenses?start=${start}&end=${end}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: revenue } = useQuery({
    queryKey: ["revenue", start, end],
    queryFn: async () => {
      const res = await fetch(`/api/revenue?start=${start}&end=${end}`);
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
        <ExpenseSection
          expenses={expenses ?? []}
          onAdd={() => setShowExpenseForm(true)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            setShowExpenseForm(false);
          }}
          showForm={showExpenseForm}
          onCloseForm={() => setShowExpenseForm(false)}
        />
      )}
      {tab === "revenue" && (
        <RevenueSection
          revenue={revenue ?? []}
          onAdd={() => setShowRevenueForm(true)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["revenue"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            setShowRevenueForm(false);
          }}
          showForm={showRevenueForm}
          onCloseForm={() => setShowRevenueForm(false)}
        />
      )}
    </div>
  );
}

function ExpenseSection({
  expenses,
  onAdd,
  onSuccess,
  showForm,
  onCloseForm,
}: {
  expenses: { id: string; amount: number; description: string | null; category: string | null; date: string }[];
  onAdd: () => void;
  onSuccess: () => void;
  showForm: boolean;
  onCloseForm: () => void;
}) {
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const create = useMutation({
    mutationFn: async (body: {
      amount: number;
      description: string | null;
      category: string | null;
      date: string;
    }) => {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">{pt.expenses}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
        >
          {pt.addExpense}
        </button>
      </div>
      {showForm && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{pt.amount}</label>
              <input
                type="number"
                step={0.01}
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{pt.description}</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{pt.category}</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{pt.date}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                create.mutate({
                  amount,
                  description: description || null,
                  category: category || null,
                  date: new Date(date).toISOString(),
                })
              }
              disabled={create.isPending}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {create.isPending ? pt.loading : pt.save}
            </button>
            <button
              type="button"
              onClick={onCloseForm}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {pt.cancel}
            </button>
          </div>
        </div>
      )}
      {!expenses.length ? (
        <p className="text-gray-500">Nenhuma despesa neste período.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.date}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.amount}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.description}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.category}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(e.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    R$ {Number(e.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{e.description ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{e.category ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RevenueSection({
  revenue,
  onAdd,
  onSuccess,
  showForm,
  onCloseForm,
}: {
  revenue: { id: string; amount: number; description: string | null; source: string | null; date: string }[];
  onAdd: () => void;
  onSuccess: () => void;
  showForm: boolean;
  onCloseForm: () => void;
}) {
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const create = useMutation({
    mutationFn: async (body: {
      amount: number;
      description: string | null;
      source: string | null;
      date: string;
    }) => {
      const res = await fetch("/api/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">{pt.revenue}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
        >
          {pt.addRevenue}
        </button>
      </div>
      {showForm && (
        <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{pt.amount}</label>
              <input
                type="number"
                step={0.01}
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{pt.description}</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{pt.source}</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{pt.date}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() =>
                create.mutate({
                  amount,
                  description: description || null,
                  source: source || null,
                  date: new Date(date).toISOString(),
                })
              }
              disabled={create.isPending}
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {create.isPending ? pt.loading : pt.save}
            </button>
            <button
              type="button"
              onClick={onCloseForm}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {pt.cancel}
            </button>
          </div>
        </div>
      )}
      {!revenue.length ? (
        <p className="text-gray-500">Nenhuma receita neste período.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.date}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.amount}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.description}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{pt.source}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {revenue.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(r.date).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    R$ {Number(r.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.description ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.source ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
