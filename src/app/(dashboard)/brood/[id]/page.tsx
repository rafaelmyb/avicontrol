"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { pt } from "@/shared/i18n/pt";
import { formatDateOnly } from "@/shared/format-date";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DeleteButton } from "@/components/action-icon-button";
import { FormPageHeader } from "@/components/form-page-header";
import { BroodQueries, BroodMutations } from "@/services/queries/brood";

type BroodEditFields = {
  actualHatchedCount: number | "";
  status: string;
};

export default function BroodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const brood = BroodQueries.useLoadBrood(id);
  const updateBrood = BroodMutations.useUpdateBrood(id);
  const deleteBrood = BroodMutations.useDeleteBrood();

  const { register, handleSubmit, reset } = useForm<BroodEditFields>({
    defaultValues: { actualHatchedCount: "", status: "" },
  });

  const cycle = brood.data;

  useEffect(() => {
    if (cycle) {
      reset({
        actualHatchedCount: cycle.actualHatchedCount ?? "",
        status: cycle.status ?? "",
      });
    }
  }, [cycle, reset]);

  const onSubmit = (data: BroodEditFields) => {
    updateBrood.mutate({
      actualHatchedCount:
        data.actualHatchedCount === ""
          ? undefined
          : Number(data.actualHatchedCount),
      status: data.status || undefined,
    });
  };

  if (brood.isLoading || !cycle) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }
  if (brood.error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{pt.error}</p>
        <Link
          href="/brood"
          className="text-gray-900 hover:underline mt-2 inline-block"
        >
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <FormPageHeader
        title={pt.broodCycle}
        backHref="/brood"
        backLabel={pt.brood}
      />

      <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
        <p>
          <span className="font-medium text-gray-700">{pt.startDate}:</span>{" "}
          {formatDateOnly(cycle.startDate)}
        </p>
        <p>
          <span className="font-medium text-gray-700">{pt.eggCount}:</span>{" "}
          {cycle.eggCount}
        </p>
        <p>
          <span className="font-medium text-gray-700">
            {pt.expectedHatchDate}:
          </span>{" "}
          {formatDateOnly(cycle.expectedHatchDate)}
        </p>
        <p>
          <span className="font-medium text-gray-700">
            {pt.expectedReturnToLayDate}:
          </span>{" "}
          {formatDateOnly(cycle.expectedReturnToLayDate)}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.actualHatchedCount}
          </label>
          <input
            type="number"
            min={0}
            {...register("actualHatchedCount", {
              setValueAs: (v) => (v === "" || v === undefined ? "" : Number(v)),
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.status}
          </label>
          <input
            type="text"
            {...register("status")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="ex: active, hatched, completed"
          />
        </div>
        {updateBrood.error && (
          <p className="text-sm text-red-600">{updateBrood.error.message}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={updateBrood.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {updateBrood.isPending ? pt.loading : pt.save}
          </button>
          <DeleteButton
            onClick={() => {
              if (window.confirm("Excluir este ciclo de choco?"))
                deleteBrood.mutate(id, {
                  onSuccess: () => router.push("/brood"),
                });
            }}
            disabled={deleteBrood.isPending}
            className="p-2"
          />
        </div>
      </form>
    </div>
  );
}
