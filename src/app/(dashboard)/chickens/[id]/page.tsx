"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { pt } from "@/shared/i18n/pt";
import { ChickenForm } from "@/modules/chicken/presentation/chicken-form";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DeleteButton } from "@/components/action-icon-button";
import { FormPageHeader } from "@/components/form-page-header";
import { ChickenQueries, ChickenMutations } from "@/services/queries/chickens";

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
  const id = params.id as string;

  const chickenQuery = ChickenQueries.useLoadChicken(id);
  const chicken = chickenQuery.data;
  const updateChicken = ChickenMutations.useUpdateChicken(id);
  const deleteChicken = ChickenMutations.useDeleteChicken();

  if (chickenQuery.isLoading || !chicken) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    );
  }
  if (chickenQuery.error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{pt.error}</p>
        <Link
          href="/chickens"
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
        title={chicken.name}
        backHref="/chickens"
        backLabel={pt.chickens}
      />
      <ChickenForm
        initialValues={{
          name: chicken.name,
          breed: chicken.breed,
          birthDate: chicken.birthDate.slice(0, 10),
          status: chicken.status,
          source: chicken.source,
          purchasePrice: chicken.purchasePrice ?? null,
        }}
        statusOptions={statusOptions}
        onSubmit={async (values) => {
          await updateChicken.mutateAsync({
            name: values.name,
            breed: values.breed,
            birthDate: values.birthDate,
            status: values.status,
            source: values.source,
            purchasePrice: values.purchasePrice ?? null,
          });
        }}
        loading={updateChicken.isPending}
        error={updateChicken.error?.message}
      />
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">
          {pt.age}: {pt.ageDays(chicken.ageInDays)}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {pt.layStartDate}:{" "}
          {new Date(chicken.layStartDate).toLocaleDateString("pt-BR")}
        </p>
        <DeleteButton
          onClick={() => {
            if (window.confirm("Excluir esta galinha?"))
              deleteChicken.mutate(id, {
                onSuccess: () => router.push("/chickens"),
              });
          }}
          disabled={deleteChicken.isPending}
        />
      </div>
    </div>
  );
}
