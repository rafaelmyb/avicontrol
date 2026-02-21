"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { pt } from "@/shared/i18n/pt";

const BATCH_QUANTITY_MIN = 2;
const BATCH_QUANTITY_MAX = 50;

const defaultBirthDate = new Date().toISOString().slice(0, 10);

export interface ChickenFormValues {
  name: string;
  addAsBatch?: boolean;
  quantity?: number;
  breed: string;
  birthDate: string;
  status: string;
  source: string;
  purchasePrice?: number | null;
}

/** Form state uses string for purchasePrice input */
type ChickenFormFields = Omit<ChickenFormValues, "purchasePrice"> & {
  purchasePrice: string;
};

interface ChickenFormProps {
  initialValues?: Partial<ChickenFormValues>;
  statusOptions: readonly { value: string; label: string }[];
  sourceOptions?: readonly { value: string; label: string }[];
  onSubmit: (values: ChickenFormValues) => Promise<void>;
  loading?: boolean;
  error?: string;
}

function getDefaultValues(initialValues?: Partial<ChickenFormValues>): ChickenFormFields {
  return {
    name: initialValues?.name ?? "",
    addAsBatch: initialValues?.addAsBatch ?? false,
    quantity: initialValues?.quantity ?? BATCH_QUANTITY_MIN,
    breed: initialValues?.breed ?? "",
    birthDate: initialValues?.birthDate ?? defaultBirthDate,
    status: initialValues?.status ?? "chick",
    source: initialValues?.source ?? "purchased",
    purchasePrice:
      initialValues?.purchasePrice != null
        ? String(initialValues.purchasePrice)
        : "",
  };
}

export function ChickenForm({
  initialValues,
  statusOptions,
  sourceOptions = [
    { value: "purchased", label: pt.purchased },
    { value: "hatched", label: pt.hatched },
  ],
  onSubmit,
  loading = false,
  error,
}: ChickenFormProps) {
  const { register, handleSubmit, watch, reset } = useForm<ChickenFormFields>({
    defaultValues: getDefaultValues(initialValues),
  });

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      reset(getDefaultValues(initialValues));
    }
  }, [initialValues, reset]);

  const addAsBatch = watch("addAsBatch");
  const source = watch("source");

  const onFormSubmit = (data: ChickenFormFields) => {
    return onSubmit({
      name: data.name,
      addAsBatch: addAsBatch || undefined,
      quantity: addAsBatch ? data.quantity : undefined,
      breed: data.breed,
      birthDate: data.birthDate,
      status: data.status,
      source: data.source,
      purchasePrice:
        data.purchasePrice === "" ? null : Number(data.purchasePrice),
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          id="addAsBatch"
          type="checkbox"
          {...register("addAsBatch")}
          className="rounded border-gray-300"
        />
        <label
          htmlFor="addAsBatch"
          className="text-sm font-medium text-gray-700"
        >
          {pt.addAsBatch}
        </label>
      </div>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {addAsBatch ? pt.batchName : pt.chickenName}
        </label>
        <input
          id="name"
          type="text"
          {...register("name", { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      {addAsBatch && (
        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {pt.quantity}
          </label>
          <input
            id="quantity"
            type="number"
            min={BATCH_QUANTITY_MIN}
            max={BATCH_QUANTITY_MAX}
            {...register("quantity", {
              valueAsNumber: true,
              min: BATCH_QUANTITY_MIN,
              max: BATCH_QUANTITY_MAX,
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
      )}
      <div>
        <label
          htmlFor="breed"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {pt.breed}
        </label>
        <input
          id="breed"
          type="text"
          {...register("breed", { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div className="min-w-0 overflow-hidden">
        <label
          htmlFor="birthDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {pt.birthDate}
        </label>
        <input
          id="birthDate"
          type="date"
          {...register("birthDate", { required: true })}
          className="w-full min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {pt.status}
        </label>
        <select
          id="status"
          {...register("status")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="source"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {pt.source}
        </label>
        <select
          id="source"
          {...register("source")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          {sourceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {source === "purchased" && (
        <div>
          <label
            htmlFor="purchasePrice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {pt.amount}
          </label>
          <input
            id="purchasePrice"
            type="number"
            min={0}
            step="0.01"
            {...register("purchasePrice")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? pt.loading : pt.save}
        </button>
      </div>
    </form>
  );
}
