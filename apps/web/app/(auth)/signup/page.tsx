import { Card, CardHeader, CardTitle, CardDescription, Button, Input } from '@elsesourav/ui';
import Link from 'next/link';
import { ROUTES } from '@elsesourav/config';

export const metadata = {
  title: 'Sign Up',
  description: 'Create your ElseSourav account.',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create ElseSourav Account</CardTitle>
          <CardDescription>One identity across all developer apps and tools</CardDescription>
        </CardHeader>
        <div className="p-6 pt-0 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Display Name</label>
            <Input placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email</label>
            <Input type="email" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">Create Account</Button>
          <div className="text-center text-xs text-zinc-400 pt-2">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="text-indigo-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
