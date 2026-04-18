import type { Metadata } from "next";
import { ForgotPasswordClient } from "./forgot-password-client";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link for your account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
