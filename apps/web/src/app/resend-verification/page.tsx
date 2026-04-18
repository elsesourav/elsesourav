import type { Metadata } from "next";
import { ResendVerificationClient } from "./resend-verification-client";

export const metadata: Metadata = {
  title: "Resend Verification",
  description: "Resend your account verification email.",
};

export default function ResendVerificationPage() {
  return <ResendVerificationClient />;
}
