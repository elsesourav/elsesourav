import { redirect } from 'next/navigation';

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const resolved = await searchParams;
  const tab = resolved?.tab;
  if (tab === 'account' || tab === 'security' || tab === 'danger') {
    redirect('/account?tab=security');
  }
  redirect('/account?tab=settings');
}
