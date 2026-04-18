import { RegisterForm } from "@/app/register/register-form";
import { PageHeader, PageShell } from "@/components/ui/page";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <PageShell width="narrow" center className="gap-6">
      <PageHeader
        eyebrow="New Account"
        title="Create your account"
        align="center"
      />

      <RegisterForm />

      <p className="ui-text-muted text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-(--brand-secondary) underline decoration-black/20 underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </PageShell>
  );
}
