"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { pt } from "@/shared/i18n/pt";
import { FormPageHeader } from "@/components/form-page-header";
import { LoadingSpinner } from "@/components/loading-spinner";
import { RevenueQueries, RevenueMutations } from "@/services/queries/revenue";

type RevenueEditFields = {
  amount: number;
  description: string;
  source: string;
  date: string;
};

export default function EditRevenuePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const revenue = RevenueQueries.useLoadRevenue(id);
  const updateRevenue = RevenueMutations.useUpdateRevenue(id);

  const { register, handleSubmit, reset } = useForm<RevenueEditFields>({
    defaultValues: { amount: 0, description: "", source: "", date: "" },
  });

  useEffect(() => {
    if (revenue.data) {
      const r = revenue.data;
      reset({
        amount: r.amount,
        description: r.description ?? "",
        source: r.source ?? "",
        date: r.date.slice(0, 10),
      });
    }
  }, [revenue.data, reset]);

  const onSubmit = (data: RevenueEditFields) => {
    updateRevenue.mutate({
      amount: data.amount,
      description: data.description || null,
      source: data.source || null,
      date: data.date,
    });
  };

  if (revenue.isLoading || !revenue.data) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }
  if (revenue.error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{pt.error}</p>
        <Link href="/finance" className="text-gray-900 hover:underline mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FormPageHeader
        title="Editar receita"
        backHref="/finance"
        backLabel={pt.finance}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.amount}
          </label>
          <input
            type="number"
            step={0.01}
            {...register("amount", { valueAsNumber: true, required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.description}
          </label>
          <input
            type="text"
            {...register("description")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.source}
          </label>
          <input
            type="text"
            {...register("source")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="min-w-0 overflow-hidden">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.date}
          </label>
          <input
            type="date"
            {...register("date", { required: true })}
            className="w-full max-w-full min-w-0 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={updateRevenue.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {updateRevenue.isPending ? pt.loading : pt.save}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {pt.cancel}
          </button>
        </div>
        {updateRevenue.error && (
          <p className="text-sm text-red-600">{updateRevenue.error.message}</p>
        )}
      </form>
    </div>
  );
}
