"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { pt } from "@/shared/i18n/pt";
import { formatDateOnly } from "@/shared/format-date";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DeleteButton } from "@/components/action-icon-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormPageHeader } from "@/components/form-page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BroodQueries, BroodMutations } from "@/services/queries/brood";
import {
  buildFinalizePayload,
  BROOD_HATCHED_STATUS,
} from "@/modules/brood/application/finalize-brood-cycle";

type BroodEditFields = {
  eggCount: number | "";
};

export default function BroodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [hatchedCountInput, setHatchedCountInput] = useState("");
  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  const brood = BroodQueries.useLoadBrood(id);
  const updateBrood = BroodMutations.useUpdateBrood(id);
  const deleteBrood = BroodMutations.useDeleteBrood();

  const { register, handleSubmit, reset } = useForm<BroodEditFields>({
    defaultValues: { eggCount: "" },
  });

  const cycle = brood.data;

  useEffect(() => {
    if (cycle) {
      reset({
        eggCount: cycle.eggCount,
      });
    }
  }, [cycle, reset]);

  const onSubmit = (data: BroodEditFields) => {
    updateBrood.mutate({
      eggCount: data.eggCount === "" ? undefined : Number(data.eggCount),
    });
  };

  const handleOpenFinalize = () => {
    updateBrood.reset();
    setHatchedCountInput("");
    setFinalizeError(null);
    setFinalizeOpen(true);
  };

  const handleFinalize = () => {
    const parsed = parseInt(hatchedCountInput, 10);
    const result = buildFinalizePayload(
      { actualHatchedCount: isNaN(parsed) ? -1 : parsed },
      cycle?.eggCount
    );
    if (!result.ok) {
      const msg =
        result.errorKey === "hatchedCountExceedsEggs"
          ? pt.hatchedCountExceedsEggs(cycle!.eggCount)
          : pt.hatchedCountInvalid;
      setFinalizeError(msg);
      return;
    }
    setFinalizeError(null);
    updateBrood.mutate(
      { actualHatchedCount: result.actualHatchedCount, status: result.status },
      {
        onSuccess: () => setFinalizeOpen(false),
        onError: (err) => setFinalizeError(err.message),
      }
    );
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

  const isHatched = cycle.status === BROOD_HATCHED_STATUS;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <FormPageHeader
        title={pt.broodCycle}
        backHref="/brood"
        backLabel={pt.brood}
      />

      <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
        <p>
          <span className="font-medium text-gray-700">{pt.status}:</span>{" "}
          {isHatched ? pt.broodHatched : pt.broodActive}
        </p>
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
        {isHatched && (
          <p>
            <span className="font-medium text-gray-700">
              {pt.actualHatchedCount}:
            </span>{" "}
            {cycle.actualHatchedCount ?? "—"}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {pt.eggCount}
          </label>
          <input
            type="number"
            min={0}
            {...register("eggCount", {
              setValueAs: (v) => (v === "" || v === undefined ? "" : Number(v)),
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        {updateBrood.error && !finalizeOpen && (
          <p className="text-sm text-red-600">{updateBrood.error.message}</p>
        )}
        <div className="flex gap-2 flex-wrap">
          <button
            type="submit"
            disabled={updateBrood.isPending}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {updateBrood.isPending && !finalizeOpen ? pt.loading : pt.save}
          </button>
          {!isHatched && (
            <button
              type="button"
              onClick={handleOpenFinalize}
              disabled={updateBrood.isPending}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {pt.finalizeBrood}
            </button>
          )}
          <DeleteButton
            onClick={() => setConfirmOpen(true)}
            disabled={deleteBrood.isPending}
            className="p-2"
          />
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title={pt.deleteBroodConfirm}
            description={pt.deleteConfirmDescription}
            confirmLabel={pt.delete}
            onConfirm={async () => {
              await deleteBrood.mutateAsync(id);
              router.push("/brood");
            }}
            loading={deleteBrood.isPending}
            variant="destructive"
          />
        </div>
      </form>

      {/* Finalize dialog */}
      <Dialog
        open={finalizeOpen}
        onOpenChange={(o) => !updateBrood.isPending && setFinalizeOpen(o)}
      >
        <DialogContent
          className="max-w-[425px]"
          onPointerDownOutside={(e) =>
            updateBrood.isPending && e.preventDefault()
          }
          onEscapeKeyDown={(e) =>
            updateBrood.isPending && e.preventDefault()
          }
        >
          <DialogHeader>
            <DialogTitle>{pt.finalizeBrood}</DialogTitle>
            <DialogDescription>{pt.hatchedCountPrompt}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {pt.hatchedCountLabel}
            </label>
            <input
              type="number"
              min={0}
              max={cycle.eggCount}
              value={hatchedCountInput}
              onChange={(e) => {
                setHatchedCountInput(e.target.value);
                setFinalizeError(null);
              }}
              disabled={updateBrood.isPending}
              className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              autoFocus
            />
            {finalizeError && (
              <p className="text-sm text-red-600 mt-1">{finalizeError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFinalizeOpen(false)}
              disabled={updateBrood.isPending}
            >
              {pt.cancel}
            </Button>
            <Button
              type="button"
              onClick={handleFinalize}
              disabled={updateBrood.isPending}
            >
              {updateBrood.isPending ? pt.loading : pt.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
