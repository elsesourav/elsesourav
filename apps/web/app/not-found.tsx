import { Button, Card, CardHeader, CardTitle, CardDescription } from '@elsesourav/ui';
import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@elsesourav/config';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-zinc-950 text-white">
      <Card className="max-w-md w-full border-zinc-800 bg-zinc-950/80 text-center">
        <CardHeader>
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
            <FileQuestion className="w-6 h-6 text-zinc-400" />
          </div>
          <CardTitle className="text-2xl text-white">404 — Page Not Found</CardTitle>
          <CardDescription className="text-zinc-400 mt-2">
            The page or software resource you are looking for does not exist or has been relocated.
          </CardDescription>
        </CardHeader>
        <div className="p-6 pt-0 flex justify-center">
          <Link href={ROUTES.HOME}>
            <Button variant="primary" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
