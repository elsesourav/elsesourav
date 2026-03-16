export type NotificationControlState = {
  emailNotifications: boolean;
  marketingEmails: boolean;
};

type NotificationPreset = {
  id: string;
  label: string;
  description: string;
  state: NotificationControlState;
};

const notificationPresets: NotificationPreset[] = [
  {
    id: "all-updates",
    label: "All updates",
    description: "Product updates, account notices, and marketing launches.",
    state: {
      emailNotifications: true,
      marketingEmails: true,
    },
  },
  {
    id: "essential-only",
    label: "Essential only",
    description: "Only product and account-related communication.",
    state: {
      emailNotifications: true,
      marketingEmails: false,
    },
  },
  {
    id: "quiet-mode",
    label: "Quiet mode",
    description: "Turn off all non-critical notifications.",
    state: {
      emailNotifications: false,
      marketingEmails: false,
    },
  },
];

export function resolveNotificationProfileLabel(
  state: NotificationControlState,
): string {
  if (state.emailNotifications && state.marketingEmails) {
    return "All updates";
  }

  if (state.emailNotifications && !state.marketingEmails) {
    return "Essential only";
  }

  if (!state.emailNotifications && state.marketingEmails) {
    return "Marketing only";
  }

  return "Quiet mode";
}

export function resolveNotificationProfileDescription(
  state: NotificationControlState,
): string {
  if (state.emailNotifications && state.marketingEmails) {
    return "You will receive account notices and promotional announcements.";
  }

  if (state.emailNotifications && !state.marketingEmails) {
    return "You will only receive important account and product notices.";
  }

  if (!state.emailNotifications && state.marketingEmails) {
    return "You will receive campaign and launch announcements only.";
  }

  return "All email notifications are currently muted.";
}

export type NotificationControlsProps = NotificationControlState & {
  sectionStatusLabel: string;
  sectionStatusTone: "neutral" | "dirty" | "saving";
  sectionFeedbackMessage: string | null;
  sectionFeedbackTone: "success" | "error" | null;
  sectionCanSave: boolean;
  sectionSaving: boolean;
  onEmailNotificationsChange: (value: boolean) => void;
  onMarketingEmailsChange: (value: boolean) => void;
  onApplyPreset: (state: NotificationControlState) => void;
  onSaveSection: () => void;
};

export function NotificationControls({
  emailNotifications,
  marketingEmails,
  sectionStatusLabel,
  sectionStatusTone,
  sectionFeedbackMessage,
  sectionFeedbackTone,
  sectionCanSave,
  sectionSaving,
  onEmailNotificationsChange,
  onMarketingEmailsChange,
  onApplyPreset,
  onSaveSection,
}: NotificationControlsProps) {
  const activeProfileLabel = resolveNotificationProfileLabel({
    emailNotifications,
    marketingEmails,
  });

  const activeProfileDescription = resolveNotificationProfileDescription({
    emailNotifications,
    marketingEmails,
  });

  const sectionStatusClassName =
    sectionStatusTone === "dirty"
      ? "border-[#f2c57c] bg-[#fff7e8] text-[#7a4a00]"
      : sectionStatusTone === "saving"
        ? "border-[#a8c2e6] bg-[#eef5ff] text-[#1e4a80]"
        : "border-black/20 bg-white text-[#4a5262]";
  const sectionFeedbackClassName =
    sectionFeedbackTone === "success"
      ? "text-emerald-700"
      : sectionFeedbackTone === "error"
        ? "text-red-600"
        : "text-[#4a5262]";

  return (
    <section className="rounded-2xl border border-black/15 bg-white p-5 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#14171f]">
            Notification Control
          </p>
          <p className="text-xs text-[#4a5262]">
            Decide what kind of emails you want and quickly switch preference
            sets.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${sectionStatusClassName}`}
          >
            {sectionStatusLabel}
          </span>
          <button
            type="button"
            onClick={onSaveSection}
            disabled={!sectionCanSave}
            className="rounded-full border border-black/20 bg-white px-4 py-2 text-sm font-medium text-[#14171f] disabled:opacity-60"
          >
            {sectionSaving ? "Saving..." : "Save notifications"}
          </button>
          <div className="rounded-full border border-black/20 bg-white px-3 py-1 text-xs font-medium text-[#14171f]">
            {activeProfileLabel}
          </div>
        </div>
      </div>

      {sectionFeedbackMessage ? (
        <p className={`mt-2 text-xs ${sectionFeedbackClassName}`}>
          {sectionFeedbackMessage}
        </p>
      ) : null}

      <p className="mt-2 text-xs text-[#4a5262]">{activeProfileDescription}</p>

      <div className="mt-4">
        <p className="text-sm font-medium text-[#14171f]">Quick Presets</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {notificationPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset.state)}
              className="rounded-xl border border-black/20 bg-white px-3 py-2 text-left text-sm text-[#14171f] transition hover:bg-black/3"
            >
              <p className="font-medium">{preset.label}</p>
              <p className="text-xs text-[#4a5262]">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="rounded-xl border border-black/20 bg-white p-3 text-sm text-[#14171f]">
          <span className="flex items-center gap-3">
            <input
              type="checkbox"
              className="size-4 rounded border border-black/25 text-[#14171f] focus:ring-0"
              checked={emailNotifications}
              onChange={(event) =>
                onEmailNotificationsChange(event.target.checked)
              }
            />
            <span className="font-medium">Product and account notices</span>
          </span>
          <p className="mt-2 text-xs text-[#4a5262]">
            Billing events, security alerts, account status, and meaningful
            product updates.
          </p>
        </label>

        <label className="rounded-xl border border-black/20 bg-white p-3 text-sm text-[#14171f]">
          <span className="flex items-center gap-3">
            <input
              type="checkbox"
              className="size-4 rounded border border-black/25 text-[#14171f] focus:ring-0"
              checked={marketingEmails}
              onChange={(event) =>
                onMarketingEmailsChange(event.target.checked)
              }
            />
            <span className="font-medium">Marketing and launch updates</span>
          </span>
          <p className="mt-2 text-xs text-[#4a5262]">
            Product launches, feature highlights, and curated platform
            campaigns.
          </p>
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-black/10 bg-black/2 px-3 py-2 text-xs text-[#4a5262]">
        Delivery channel: Email
      </div>
    </section>
  );
}
