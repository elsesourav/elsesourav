import { Card, CardContent, CardFooter, CardHeader, Skeleton } from '@elsesourav/ui';

export default function ForgotPasswordLoading() {
  return (
    <Card className="w-full max-w-md border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-md shadow-2xl p-6 space-y-6 rounded-3xl">
      <CardHeader className="text-center space-y-3 pb-2">
        <Skeleton className="h-7 w-48 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-64 mx-auto rounded-lg" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <Skeleton className="h-11 w-full rounded-xl pt-2" />
      </CardContent>
      <CardFooter className="flex justify-center pt-2 border-t border-[hsl(var(--border-subtle))]">
        <Skeleton className="h-4 w-44 rounded" />
      </CardFooter>
    </Card>
  );
}
