import {
  formatDateTime,
  type UserDeletionScheduleView,
} from "@/lib/view-models";

export const ACCOUNT_DELETION_CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

export function normalizeDeletionConfirmationValue(value: string): string {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

export function isDeletionConfirmationPhraseValid(value: string): boolean {
  return (
    normalizeDeletionConfirmationValue(value) ===
    ACCOUNT_DELETION_CONFIRMATION_PHRASE
  );
}

export type DeletionSectionStatus = {
  label: string;
  tone: "neutral" | "scheduled" | "deleted" | "saving" | "error";
};

export function resolveDeletionSectionStatus(
  schedule: UserDeletionScheduleView,
  pendingAction: "schedule" | "cancel" | null,
  statusTone: "success" | "error" | null,
): DeletionSectionStatus {
  if (pendingAction) {
    return {
      label: "Updating...",
      tone: "saving",
    };
  }

  if (schedule.deletedAt) {
    return {
      label: "Deleted",
      tone: "deleted",
    };
  }

  if (schedule.isScheduled) {
    return {
      label: "Scheduled",
      tone: "scheduled",
    };
  }

  if (statusTone === "error") {
    return {
      label: "Action needed",
      tone: "error",
    };
  }

  return {
    label: "No schedule",
    tone: "neutral",
  };
}

export type DeletionControlsProps = {
  schedule: UserDeletionScheduleView;
  delayDays: number;
  delayOptions: number[];
  confirmationValue: string;
  pendingAction: "schedule" | "cancel" | null;
  statusMessage: string | null;
  statusTone: "success" | "error" | null;
  onDelayDaysChange: (value: number) => void;
  onConfirmationValueChange: (value: string) => void;
  onSchedule: () => void;
  onCancelSchedule: () => void;
  onResetFlow: () => void;
};

const secondaryButtonClassName =
  "rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-medium text-[#14171f] disabled:opacity-60";
const dangerButtonClassName =
  "rounded-full bg-[#c42039] px-4 py-2 text-sm font-medium text-white disabled:opacity-60";

export function DeletionControls({
  schedule,
  delayDays,
  delayOptions,
  confirmationValue,
  pendingAction,
  statusMessage,
  statusTone,
  onDelayDaysChange,
  onConfirmationValueChange,
  onSchedule,
  onCancelSchedule,
  onResetFlow,
}: DeletionControlsProps) {
  const isDeleted = schedule.deletedAt !== null;
  const isScheduled = schedule.isScheduled;
  const isBusy = pendingAction !== null;
  const showConfirmationStep = !isDeleted && !isScheduled;
  const canSchedule =
    showConfirmationStep &&
    !isBusy &&
    isDeletionConfirmationPhraseValid(confirmationValue);

  const sectionStatus = resolveDeletionSectionStatus(
    schedule,
    pendingAction,
    statusTone,
  );
  const sectionStatusClassName =
    sectionStatus.tone === "scheduled"
      ? "border-[#f2c9d1] bg-white text-[#941e33]"
      : sectionStatus.tone === "deleted"
        ? "border-[#ef9aa8] bg-[#ffeef2] text-[#941e33]"
        : sectionStatus.tone === "saving"
          ? "border-[#a8c2e6] bg-[#eef5ff] text-[#1e4a80]"
          : sectionStatus.tone === "error"
            ? "border-[#ef9aa8] bg-[#ffeef2] text-[#941e33]"
            : "border-black/20 bg-white text-[#4a5262]";

  return (
    <section className="rounded-2xl border border-[#f2c9d1] bg-[#fff7f8] p-5 shadow-[0_14px_30px_-24px_rgba(120,15,35,0.55)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#941e33]">
            Account Deletion
          </p>
          <p className="text-xs text-[#4a5262]">
            This is permanent. Use a guided flow to schedule deletion and keep a
            grace period for cancellation.
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${sectionStatusClassName}`}
        >
          {sectionStatus.label}
        </span>
      </div>

      {isDeleted ? (
        <p className="mt-3 rounded-xl border border-[#f2c9d1] bg-white px-3 py-2 text-sm text-[#941e33]">
          This account was deleted on {formatDateTime(schedule.deletedAt)}.
        </p>
      ) : isScheduled ? (
        <div className="mt-3 rounded-xl border border-[#f2c9d1] bg-white px-3 py-2 text-sm text-[#941e33]">
          <p>
            Deletion is scheduled for{" "}
            {formatDateTime(schedule.scheduledDeletionAt)}.
          </p>
          <p className="mt-1 text-xs text-[#4a5262]">
            You can still cancel this request before the scheduled date.
          </p>
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#4a5262]">
          No account deletion is currently scheduled.
        </p>
      )}

      {showConfirmationStep ? (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,240px)_1fr] sm:items-end">
            <label className="text-sm text-[#14171f]">
              Step 1: choose grace period
              <select
                className="mt-2 w-full rounded-xl border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
                value={delayDays}
                onChange={(event) =>
                  onDelayDaysChange(Number(event.target.value))
                }
                disabled={isBusy}
              >
                {delayOptions.map((days) => (
                  <option key={days} value={days}>
                    {days} days
                  </option>
                ))}
              </select>
            </label>

            <div className="rounded-xl border border-black/15 bg-white px-3 py-2 text-xs text-[#4a5262]">
              Step 2: type{" "}
              <span className="font-semibold text-[#941e33]">
                {ACCOUNT_DELETION_CONFIRMATION_PHRASE}
              </span>{" "}
              to unlock scheduling.
            </div>
          </div>

          <label className="text-sm text-[#14171f]">
            Confirmation phrase
            <input
              type="text"
              value={confirmationValue}
              placeholder={ACCOUNT_DELETION_CONFIRMATION_PHRASE}
              className="mt-2 w-full rounded-xl border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f] placeholder:text-[#6d7587]"
              onChange={(event) =>
                onConfirmationValueChange(event.target.value)
              }
              disabled={isBusy}
            />
            <p className="mt-1 text-xs text-[#4a5262]">
              Must exactly match the phrase above.
            </p>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSchedule}
              disabled={!canSchedule}
              className={dangerButtonClassName}
            >
              {pendingAction === "schedule"
                ? "Scheduling..."
                : "Step 3: schedule deletion"}
            </button>
            <button
              type="button"
              onClick={onResetFlow}
              disabled={isBusy}
              className={secondaryButtonClassName}
            >
              Reset confirmation
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onCancelSchedule}
            disabled={isDeleted || !isScheduled || isBusy}
            className={secondaryButtonClassName}
          >
            {pendingAction === "cancel"
              ? "Canceling..."
              : "Cancel scheduled deletion"}
          </button>
        </div>
      )}

      {statusMessage ? (
        <p
          className={`mt-3 text-sm ${
            statusTone === "success"
              ? "text-emerald-700"
              : statusTone === "error"
                ? "text-red-600"
                : "text-[#4a5262]"
          }`}
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      ) : null}
    </section>
  );
}
