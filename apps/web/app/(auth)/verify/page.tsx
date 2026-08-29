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
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md shadow-2xl text-center">
      <CardHeader className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-indigo-900/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
          <MailCheck className="w-7 h-7" />
        </div>
        <CardTitle className="text-2xl font-bold text-zinc-100">Check Your Email</CardTitle>
        <CardDescription className="text-zinc-400 max-w-sm">
          We have sent a verification link to your email address. Please click the link to confirm
          your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-zinc-500">
          Did not receive the email? Check your spam folder or wait a few minutes before requesting
          another.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-zinc-800/50 pt-4">
        <Link href="/login">
          <Button variant="outline" className="border-zinc-700 text-zinc-300">
            Return to Sign In
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
