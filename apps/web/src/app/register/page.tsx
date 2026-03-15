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

      <p className="text-center text-sm text-[#3f4757]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#1f5ed4] underline decoration-black/20 underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </PageShell>
  );
}
