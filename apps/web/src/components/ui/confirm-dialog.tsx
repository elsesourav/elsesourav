"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmTone = "danger",
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmTone?: "danger" | "primary";
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} width="md">
      <p className="text-sm text-[#4c5770]">{description}</p>
      <div className="mt-5 flex items-center justify-end gap-2">
        <Button tone="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          tone={confirmTone === "danger" ? "danger" : "primary"}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? "Please wait..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
