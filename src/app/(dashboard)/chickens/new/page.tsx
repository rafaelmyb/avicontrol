"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pt } from "@/shared/i18n/pt";
import { ChickenForm } from "@/modules/chicken/presentation/chicken-form";
import { FormPageHeader } from "@/components/form-page-header";

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
      source: string;
      purchasePrice?: number | null;
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
    <div className="p-6 max-w-lg mx-auto">
      <FormPageHeader
        title={pt.addChicken}
        backHref="/chickens"
        backLabel={pt.chickens}
      />
      <ChickenForm
        statusOptions={statusOptions}
        onSubmit={(values) =>
          create.mutateAsync({
            name: values.name,
            breed: values.breed,
            birthDate: values.birthDate,
            status: values.status,
            source: values.source,
            purchasePrice: values.purchasePrice ?? null,
          })
        }
        loading={create.isPending}
        error={create.error?.message}
      />
    </div>
  );
}
