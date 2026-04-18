import type { Metadata } from "next";
import { VerifyEmailClient } from "./verify-email-client";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email using the token in your inbox.",
};

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
