"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { pt } from "@/shared/i18n/pt";
import { LoadingSpinner } from "@/components/loading-spinner";
import { SettingsQueries, SettingsMutations } from "@/services/queries/settings";

type SettingsFields = {
  eggPricePerUnit: string;
};

export default function SettingsPage() {
  const settings = SettingsQueries.useLoadSettings();
  const updateSettings = SettingsMutations.useUpdateSettings();

  const { register, handleSubmit, reset } = useForm<SettingsFields>({
    defaultValues: { eggPricePerUnit: "" },
  });

  useEffect(() => {
    if (settings.data?.eggPricePerUnit != null) {
      reset({ eggPricePerUnit: String(settings.data.eggPricePerUnit) });
    } else {
      reset({ eggPricePerUnit: "" });
    }
  }, [settings.data?.eggPricePerUnit, reset]);

  const onSubmit = (data: SettingsFields) => {
    const value =
      data.eggPricePerUnit.trim() === ""
        ? null
        : Number(data.eggPricePerUnit);
    if (value !== null && (Number.isNaN(value) || value < 0)) return;
    updateSettings.mutate({ eggPricePerUnit: value });
  };

  if (settings.isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }
  if (settings.error || !settings.data) {
    return (
      <div className="p-6">
        <p className="text-red-600">{pt.error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {pt.settings}
      </h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md mx-auto space-y-4"
      >
        <div>
          <label
            htmlFor="eggPricePerUnit"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {pt.eggPricePerUnit}
          </label>
          <input
            id="eggPricePerUnit"
            type="number"
            step={0.01}
            min={0}
            {...register("eggPricePerUnit")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="0,00"
          />
          <p className="mt-1 text-xs text-gray-500">{pt.eggPricePerUnitHelp}</p>
        </div>
        <button
          type="submit"
          disabled={updateSettings.isPending}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {updateSettings.isPending ? pt.loading : pt.save}
        </button>
      </form>
    </div>
  );
}
