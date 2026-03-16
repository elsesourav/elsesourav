import { PageHeader, PageShell } from "@/components/ui/page";
import { requireUserContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import {
  formatDateTime,
  type UserDeletionScheduleView,
  type UserSettingsView,
} from "@/lib/view-models";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

const defaultSettings: UserSettingsView = {
  themeMode: "system",
  customTheme: null,
  emailNotifications: true,
  marketingEmails: false,
  updatedAt: null,
};

const defaultDeletionSchedule: UserDeletionScheduleView = {
  scheduledDeletionAt: null,
  deletedAt: null,
  isScheduled: false,
  minimumDelayDays: 7,
  maximumDelayDays: 30,
  defaultDelayDays: 14,
};

export default async function SettingsPage() {
  const user = await requireUserContext();

  const [settings, deletionSchedule] = await Promise.all([
    fetchServiceData<UserSettingsView>({
      service: "user",
      path: "/v1/user/settings",
      user,
    }).catch(() => defaultSettings),
    fetchServiceData<UserDeletionScheduleView>({
      service: "user",
      path: "/v1/user/settings/deletion",
      user,
    }).catch(() => defaultDeletionSchedule),
  ]);

  return (
    <PageShell width="content" className="gap-6">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Manage your account preferences and communication settings."
      />

      <SettingsForm
        initialSettings={{
          themeMode: settings.themeMode,
          emailNotifications: settings.emailNotifications,
          marketingEmails: settings.marketingEmails,
          customTheme: settings.customTheme,
        }}
        initialDeletionSchedule={deletionSchedule}
      />

      <p className="text-xs text-[#4a5262]">
        Last updated: {formatDateTime(settings.updatedAt)}
      </p>
    </PageShell>
  );
}
