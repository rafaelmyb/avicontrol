"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { pt } from "@/shared/i18n/pt";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  variant?: "default" | "destructive";
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading = false,
  variant = "default",
}: ConfirmDialogProps) => {
  const confirmText = confirmLabel ?? pt.confirm;
  const cancelText = cancelLabel ?? pt.cancel;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showLoading = loading || isSubmitting;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!showLoading) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !showLoading && onOpenChange(o)}>
      <DialogContent
        className="max-w-[425px]"
        onPointerDownOutside={(e) => showLoading && e.preventDefault()}
        onEscapeKeyDown={(e) => showLoading && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={showLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={showLoading}
          >
            {showLoading ? pt.loading : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
