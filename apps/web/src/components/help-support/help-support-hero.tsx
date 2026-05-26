import { HelpCircle } from "lucide-react";

export function HelpSupportHero() {
  return (
    <div className="flex flex-col items-center text-center space-y-4 py-8">
      <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
        <HelpCircle className="h-6 w-6 text-brand-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-text-primary">
        How can we help?
      </h1>
      <p className="text-sm text-text-muted max-w-md">
        Search for articles, check updates, or contact our support team directly.
      </p>
    </div>
  );
}
