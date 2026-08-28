import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@elsesourav/ui';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Authentication Error | ElseSourav',
  description: 'An issue occurred during sign in.',
};

export default function AuthErrorPage() {
  return (
    <Card className="border-red-900/40 bg-zinc-900/60 backdrop-blur-md shadow-2xl text-center">
      <CardHeader className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400 mb-2">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <CardTitle className="text-2xl font-bold text-zinc-100">Authentication Failed</CardTitle>
        <CardDescription className="text-zinc-400 max-w-sm">
          We encountered an issue while verifying your identity with the authentication provider.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-zinc-500">
          This could happen if the session expired, the authorization code was already consumed, or permissions were cancelled.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center gap-3 border-t border-zinc-800/50 pt-4">
        <Link href="/login">
          <Button variant="outline" className="border-zinc-700 text-zinc-300">
            Return to Sign In
          </Button>
        </Link>
        <Link href="/support">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
            Get Support
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
