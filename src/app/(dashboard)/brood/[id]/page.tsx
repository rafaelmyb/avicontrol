"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { pt } from "@/shared/i18n/pt";
import { formatDateOnly } from "@/shared/format-date";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DeleteButton } from "@/components/action-icon-button";
import { FormPageHeader } from "@/components/form-page-header";

interface BroodCycleDto {
  id: string;
  chickenId: string;
  startDate: string;
  eggCount: number;
  expectedHatchDate: string;
  expectedReturnToLayDate: string;
  actualHatchedCount: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function BroodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const {
    data: cycle,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["brood", id],
    queryFn: async () => {
      const res = await fetch(`/api/brood/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json() as Promise<BroodCycleDto>;
    },
    enabled: !!id,
  });

  const [actualHatchedCount, setActualHatchedCount] = useState<number | "">("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (cycle) {
      setActualHatchedCount(cycle.actualHatchedCount ?? "");
      setStatus(cycle.status);
    }
  }, [cycle]);

  const update = useMutation({
    mutationFn: async (body: {
      actualHatchedCount?: number;
      status?: string;
    }) => {
      const res = await fetch(`/api/brood/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brood"] });
      queryClient.invalidateQueries({ queryKey: ["brood", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["chickens"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/brood/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brood"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["chickens"] });
      router.push("/brood");
    },
  });

  if (isLoading || !cycle) {
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
        <Link
          href="/brood"
          className="text-gray-900 hover:underline mt-2 inline-block"
        >
          Voltar
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate({
      actualHatchedCount:
        actualHatchedCount === "" ? undefined : Number(actualHatchedCount),
      status: status || undefined,
    });
  };

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.actualHatchedCount}
          </label>
          <input
            type="number"
            min={0}
            value={actualHatchedCount === "" ? "" : actualHatchedCount}
            onChange={(e) =>
              setActualHatchedCount(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.status}
          </label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="ex: active, hatched, completed"
          />
        </div>
        {update.error && (
          <p className="text-sm text-red-600">{update.error.message}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={update.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {update.isPending ? pt.loading : pt.save}
          </button>
          <DeleteButton
            onClick={() => {
              if (window.confirm("Excluir este ciclo de choco?"))
                deleteMutation.mutate();
            }}
            disabled={deleteMutation.isPending}
            className="p-2"
          />
        </div>
      </form>
    </div>
  );
}
