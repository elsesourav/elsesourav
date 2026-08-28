import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Button, Label } from '@elsesourav/ui';

export const metadata: Metadata = {
  title: 'Forgot Password | ElseSourav',
  description: 'Reset your ElseSourav account password.',
};

export default function ForgotPasswordPage() {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-zinc-100">Reset Password</CardTitle>
        <CardDescription className="text-zinc-400">
          Enter your email address and we will send you a password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" required>
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="developer@example.com"
              required
              className="bg-zinc-950/50 border-zinc-800 text-zinc-100"
            />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
            Send Reset Link
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-zinc-800/50 pt-4">
        <p className="text-sm text-zinc-400">
          Remember your password?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
