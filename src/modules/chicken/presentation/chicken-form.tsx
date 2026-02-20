"use client";

import { useState } from "react";
import { pt } from "@/shared/i18n/pt";

export interface ChickenFormValues {
  name: string;
  breed: string;
  birthDate: string;
  status: string;
}

interface ChickenFormProps {
  initialValues?: Partial<ChickenFormValues>;
  statusOptions: readonly { value: string; label: string }[];
  onSubmit: (values: ChickenFormValues) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function ChickenForm({
  initialValues,
  statusOptions,
  onSubmit,
  loading = false,
  error,
}: ChickenFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [breed, setBreed] = useState(initialValues?.breed ?? "");
  const [birthDate, setBirthDate] = useState(
    initialValues?.birthDate ?? new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState(initialValues?.status ?? "chick");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({ name, breed, birthDate, status });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          {pt.chickenName}
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div>
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
          {pt.breed}
        </label>
        <input
          id="breed"
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
          {pt.birthDate}
        </label>
        <input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          {pt.status}
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
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
