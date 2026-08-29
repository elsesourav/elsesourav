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
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | ElseSourav',
  description: 'Access your ElseSourav account, developer tools, and personal software library.',
};

export default function LoginPage() {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-zinc-100">Sign In to ElseSourav</CardTitle>
        <CardDescription className="text-zinc-400">
          Enter your credentials to access your personal software library
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="flex justify-center border-t border-zinc-800/50 pt-4">
        <p className="text-sm text-zinc-400">
          Do not have an account?{' '}
          <Link
            href="/signup"
            className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
