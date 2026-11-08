import { Metadata } from 'next';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
} from '@elsesourav/ui';
import { MailCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Check Your Email | ElseSourav',
  description: 'Verification link sent to your email.',
};

export default function VerifyEmailPage() {
  return (
    <Card className="w-full max-w-md border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-md shadow-2xl rounded-3xl text-center">
      <CardHeader className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
          <MailCheck className="w-7 h-7" />
        </div>
        <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">Check Your Email</CardTitle>
        <CardDescription className="text-[hsl(var(--muted-foreground))] max-w-sm">
          We have sent a verification link to your email address. Please click the link to confirm
          your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          Did not receive the email? Check your spam folder or wait a few minutes before requesting
          another.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-[hsl(var(--border-subtle))] pt-4">
        <Link href="/login">
          <Button variant="outline" className="border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
            Return to Sign In
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
