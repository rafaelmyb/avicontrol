"use client";

import { pt } from "@/shared/i18n/pt";
import { ChickenForm } from "@/modules/chicken/presentation/chicken-form";
import { FormPageHeader } from "@/components/form-page-header";
import { ChickenMutations } from "@/services/queries/chickens";

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
  const createChicken = ChickenMutations.useCreateChicken();

  return (
    <div className="p-6 max-w-lg mx-auto">
      <FormPageHeader
        title={pt.addChicken}
        backHref="/chickens"
        backLabel={pt.chickens}
      />
      <ChickenForm
        statusOptions={statusOptions}
        onSubmit={async (values) => {
          if (values.addAsBatch && values.quantity != null) {
            await createChicken.mutateAsync({
              batch: true,
              batchName: values.name,
              quantity: values.quantity,
              breed: values.breed,
              birthDate: values.birthDate,
              status: values.status,
              source: values.source,
              purchasePrice: values.purchasePrice ?? null,
            });
          } else {
            await createChicken.mutateAsync({
              batch: false,
              name: values.name,
              breed: values.breed,
              birthDate: values.birthDate,
              status: values.status,
              source: values.source,
              purchasePrice: values.purchasePrice ?? null,
            });
          }
        }}
        loading={createChicken.isPending}
        error={createChicken.error?.message}
      />
    </div>
  );
}
