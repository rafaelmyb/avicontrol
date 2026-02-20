"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function NewChickenPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const create = useMutation({
    mutationFn: async (body: {
      name: string;
      breed: string;
      birthDate: string;
      status: string;
    }) => {
      const res = await fetch("/api/chickens", {
        method: "POST",
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
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/chickens");
    },
  });

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {pt.addChicken}
      </h1>
      <ChickenForm
        statusOptions={statusOptions}
        onSubmit={(values) =>
          create.mutateAsync({
            name: values.name,
            breed: values.breed,
            birthDate: values.birthDate,
            status: values.status,
          })
        }
        loading={create.isPending}
        error={create.error?.message}
      />
    </div>
  );
}
