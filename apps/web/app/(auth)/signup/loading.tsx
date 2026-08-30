import { Card, CardContent, CardFooter, CardHeader, Skeleton } from '@elsesourav/ui';

export default function SignupLoading() {
  return (
    <Card className="w-full max-w-md border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 backdrop-blur-xl shadow-2xl p-6 space-y-5 rounded-3xl">
      <CardHeader className="text-center space-y-2.5 pb-1 pt-2">
        <Skeleton className="h-5 w-40 mx-auto rounded-full" />
        <Skeleton className="h-7 w-56 mx-auto rounded-xl" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <Skeleton className="h-4 w-36 mx-auto rounded" />

        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-1">
          <Skeleton className="h-4 w-28 rounded-lg" />
          <Skeleton className="h-2 w-14 rounded-full" />
        </div>

        {/* Step 1 Fields */}
        <div className="space-y-3">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Username */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          {/* Continue Button */}
          <Skeleton className="h-11 w-full rounded-xl pt-2" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-2 border-t border-[hsl(var(--border-subtle))]">
        <Skeleton className="h-4 w-44 rounded" />
      </CardFooter>
    </Card>
  );
}
