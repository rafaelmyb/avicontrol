"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { pt } from "@/shared/i18n/pt";
import { FormPageHeader } from "@/components/form-page-header";
import { ChickenQueries } from "@/services/queries/chickens";
import { BroodMutations } from "@/services/queries/brood";

type BroodNewFields = {
  chickenId: string;
  startDate: string;
  eggCount: number;
};

const defaultValues: BroodNewFields = {
  chickenId: "",
  startDate: new Date().toISOString().slice(0, 10),
  eggCount: 0,
};

export default function NewBroodPage() {
  const router = useRouter();
  const chickens = ChickenQueries.useLoadChickens({
    page: 1,
    limit: 500,
    status: null,
    batchName: null,
    orderBy: "name",
    orderDirection: "asc",
  });
  const createBrood = BroodMutations.useCreateBrood();

  const { register, handleSubmit, watch } = useForm<BroodNewFields>({
    defaultValues,
  });

  const chickenId = watch("chickenId");
  const chickenOptions = chickens.data?.chickens ?? [];

  const onSubmit = (data: BroodNewFields) => {
    if (!data.chickenId) return;
    createBrood.mutate({
      chickenId: data.chickenId,
      startDate: data.startDate,
      eggCount: data.eggCount,
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <FormPageHeader
        title={pt.addBroodCycle}
        backHref="/brood"
        backLabel={pt.brood}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.chickens}
          </label>
          <select
            {...register("chickenId", { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Selecione</option>
            {chickenOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0 overflow-hidden">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.startDate}
          </label>
          <input
            type="date"
            {...register("startDate", { required: true })}
            className="w-full max-w-full min-w-0 px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.eggCount}
          </label>
          <input
            type="number"
            min={0}
            {...register("eggCount", { valueAsNumber: true, min: 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!chickenId || createBrood.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {createBrood.isPending ? pt.loading : pt.save}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {pt.cancel}
          </button>
        </div>
        {createBrood.error && (
          <p className="text-sm text-red-600">{createBrood.error.message}</p>
        )}
      </form>
    </div>
  );
}
