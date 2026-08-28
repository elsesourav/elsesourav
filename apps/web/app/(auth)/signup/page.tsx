import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@elsesourav/ui';
import { SignUpForm } from '@/components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Create Account | ElseSourav',
  description: 'Join the ElseSourav ecosystem for developer tools and software utilities.',
};

export default function SignUpPage() {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-zinc-100">Create ElseSourav Account</CardTitle>
        <CardDescription className="text-zinc-400">
          One account across all ElseSourav applications and developer tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
      </CardContent>
      <CardFooter className="flex justify-center border-t border-zinc-800/50 pt-4">
        <p className="text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
