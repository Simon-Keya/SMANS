// components/shared/ConfirmDialog.tsx
"use client";

import { Button } from "@/components/ui/Button";
import { AlertTriangle, Info, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";

type Variant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
}

const variantConfig: Record<
  Variant,
  { icon: React.ReactNode; iconBg: string; confirmClass: string }
> = {
  danger: {
    icon: <Trash2 className="h-6 w-6 text-error" />,
    iconBg: "bg-error/10",
    confirmClass: "bg-error hover:bg-error/90 text-white border-error",
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-warning" />,
    iconBg: "bg-warning/10",
    confirmClass: "bg-warning hover:bg-warning/90 text-white border-warning",
  },
  info: {
    icon: <Info className="h-6 w-6 text-info" />,
    iconBg: "bg-info/10",
    confirmClass: "bg-primary hover:bg-primary-focus text-primary-content border-primary",
  },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { icon, iconBg, confirmClass } = variantConfig[variant];

  // Focus cancel button when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open && !loading) onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  async function handleConfirm() {
    await onConfirm();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-neutral/60 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Dialog panel */}
      <div className="relative z-10 w-full max-w-md bg-base-100 rounded-2xl shadow-2xl border border-neutral/20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1 rounded-lg text-base-content/40 hover:text-base-content hover:bg-base-200 transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-5`}>
            {icon}
          </div>

          {/* Title */}
          <h2
            id="confirm-dialog-title"
            className="text-xl font-bold text-base-content mb-2"
          >
            {title}
          </h2>

          {/* Description */}
          <p className="text-base-content/60 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral/20" />

        {/* Actions */}
        <div className="px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 bg-base-200/40">
          <Button
            ref={cancelRef}
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-neutral/40 text-base-content hover:bg-base-200"
          >
            {cancelLabel}
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={`${confirmClass} font-semibold transition-all`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm" />
                Processing...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}