"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { pt } from "@/shared/i18n/pt";
import { FormPageHeader } from "@/components/form-page-header";
import { RevenueMutations } from "@/services/queries/revenue";

type RevenueNewFields = {
  amount: number;
  description: string;
  source: string;
  date: string;
};

const defaultValues: RevenueNewFields = {
  amount: 0,
  description: "",
  source: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function NewRevenuePage() {
  const router = useRouter();
  const createRevenue = RevenueMutations.useCreateRevenue();

  const { register, handleSubmit } = useForm<RevenueNewFields>({
    defaultValues,
  });

  const onSubmit = (data: RevenueNewFields) => {
    createRevenue.mutate({
      amount: data.amount,
      description: data.description || null,
      source: data.source || null,
      date: data.date,
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FormPageHeader
        title={pt.addRevenue}
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
            disabled={createRevenue.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {createRevenue.isPending ? pt.loading : pt.save}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {pt.cancel}
          </button>
        </div>
        {createRevenue.error && (
          <p className="text-sm text-red-600">{createRevenue.error.message}</p>
        )}
      </form>
    </div>
  );
}
