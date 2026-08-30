import { Metadata } from 'next';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@elsesourav/ui';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | ElseSourav',
  description: 'Reset your ElseSourav account password securely.',
};

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-md shadow-2xl rounded-3xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">Reset Password</CardTitle>
        <CardDescription className="text-[hsl(var(--muted-foreground))]">
          Enter your registered email address or username to receive a password reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
      <CardFooter className="flex justify-center border-t border-[hsl(var(--border-subtle))] pt-4">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Remember your password?{' '}
          <Link
            href="/login"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
