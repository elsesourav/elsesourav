import { Metadata } from 'next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
  Label,
} from '@elsesourav/ui';

export const metadata: Metadata = {
  title: 'Set New Password | ElseSourav',
  description: 'Enter your new ElseSourav account password.',
};

export default function ResetPasswordPage() {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-zinc-100">Set New Password</CardTitle>
        <CardDescription className="text-zinc-400">
          Please choose a strong password with at least 8 characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" required>
              New Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              className="bg-zinc-950/50 border-zinc-800 text-zinc-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" required>
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              className="bg-zinc-950/50 border-zinc-800 text-zinc-100"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
          >
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
