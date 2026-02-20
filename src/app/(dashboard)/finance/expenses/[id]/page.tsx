"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { pt } from "@/shared/i18n/pt";
import { FormPageHeader } from "@/components/form-page-header";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: expense, isLoading, error } = useQuery({
    queryKey: ["expenses", id],
    queryFn: async () => {
      const res = await fetch(`/api/expenses/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json() as Promise<{
        id: string;
        amount: number;
        description: string | null;
        category: string | null;
        date: string;
      }>;
    },
    enabled: !!id,
  });

  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount);
      setDescription(expense.description ?? "");
      setCategory(expense.category ?? "");
      setDate(expense.date.slice(0, 10));
    }
  }, [expense]);

  const update = useMutation({
    mutationFn: async (body: {
      amount: number;
      description: string | null;
      category: string | null;
      date: string;
    }) => {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/finance");
    },
  });

  if (isLoading || !expense) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{pt.error}</p>
        <Link href="/finance" className="text-gray-900 hover:underline mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({
      amount,
      description: description || null,
      category: category || null,
      date: new Date(date).toISOString(),
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FormPageHeader
        title="Editar despesa"
        backHref="/finance"
        backLabel={pt.finance}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.amount}
          </label>
          <input
            type="number"
            step={0.01}
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.description}
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.category}
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="min-w-0 overflow-hidden">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.date}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full max-w-full min-w-0 px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={update.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {update.isPending ? pt.loading : pt.save}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {pt.cancel}
          </button>
        </div>
        {update.error && (
          <p className="text-sm text-red-600">{update.error.message}</p>
        )}
      </form>
    </div>
  );
}
