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
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Authentication Error | ElseSourav',
  description: 'An issue occurred during sign in.',
};

export default function AuthErrorPage() {
  return (
    <Card className="w-full max-w-md border-rose-500/30 bg-[hsl(var(--card))] backdrop-blur-md shadow-2xl rounded-3xl text-center">
      <CardHeader className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">Authentication Failed</CardTitle>
        <CardDescription className="text-[hsl(var(--muted-foreground))] max-w-sm">
          We encountered an issue while verifying your identity with the authentication provider.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          This could happen if the session expired, the authorization code was already consumed, or
          permissions were cancelled.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center gap-3 border-t border-[hsl(var(--border-subtle))] pt-4">
        <Link href="/login">
          <Button variant="outline" className="border-[hsl(var(--border))] text-[hsl(var(--foreground))]">
            Return to Sign In
          </Button>
        </Link>
        <Link href="/support">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">Get Support</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
