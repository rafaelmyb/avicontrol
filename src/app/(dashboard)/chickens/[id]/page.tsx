"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { pt } from "@/shared/i18n/pt";
import { ChickenForm } from "@/modules/chicken/presentation/chicken-form";

const statusOptions = [
  { value: "chick", label: pt.chick },
  { value: "pullet", label: pt.pullet },
  { value: "laying", label: pt.laying },
  { value: "brooding", label: pt.brooding },
  { value: "recovering", label: pt.recovering },
  { value: "retired", label: pt.retired },
  { value: "sold", label: pt.sold },
  { value: "deceased", label: pt.deceased },
] as const;

export default function ChickenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const { data: chicken, isLoading, error } = useQuery({
    queryKey: ["chickens", id],
    queryFn: async () => {
      const res = await fetch(`/api/chickens/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!id,
  });

  const update = useMutation({
    mutationFn: async (body: {
      name: string;
      breed: string;
      birthDate: string;
      status: string;
    }) => {
      const res = await fetch(`/api/chickens/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["chickens"] });
      queryClient.invalidateQueries({ queryKey: ["chickens", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/chickens/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chickens"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/chickens");
    },
  });

  if (isLoading || !chicken) {
    return (
      <div className="p-6">
        <p className="text-gray-500">{pt.loading}</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{pt.error}</p>
        <Link href="/chickens" className="text-gray-900 hover:underline mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{chicken.name}</h1>
        <Link
          href="/chickens"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← {pt.chickens}
        </Link>
      </div>
      <ChickenForm
        initialValues={{
          name: chicken.name,
          breed: chicken.breed,
          birthDate: chicken.birthDate.slice(0, 10),
          status: chicken.status,
        }}
        statusOptions={statusOptions}
        onSubmit={(values) =>
          update.mutateAsync({
            name: values.name,
            breed: values.breed,
            birthDate: values.birthDate,
            status: values.status,
          })
        }
        loading={update.isPending}
        error={update.error?.message}
      />
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">
          {pt.age}: {pt.ageDays(chicken.ageInDays)}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {pt.layStartDate}:{" "}
          {new Date(chicken.layStartDate).toLocaleDateString("pt-BR")}
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Excluir esta galinha?")) deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
          className="text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          {pt.delete}
        </button>
      </div>
    </div>
  );
}
