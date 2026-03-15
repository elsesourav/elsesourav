import { LoginForm } from "@/app/login/login-form";
import { PageHeader, PageShell } from "@/components/ui/page";
import Link from "next/link";

export default function LoginPage() {
  return (
    <PageShell width="narrow" center className="gap-6">
      <PageHeader eyebrow="Account Access" title="Sign in" align="center" />

      <LoginForm />

      <p className="text-center text-sm text-[#3f4757]">
        New here?{" "}
        <Link
          href="/register"
          className="text-[#1f5ed4] underline decoration-black/20 underline-offset-2"
        >
          Create an account
        </Link>
      </p>
    </PageShell>
  );
}
