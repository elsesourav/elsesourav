import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="ui-text-primary mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-4 px-6 py-16 sm:px-10">
      <p className="ui-text-muted text-xs font-semibold uppercase tracking-[0.15em]">
        404
      </p>
      <h1 className="ui-text-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="ui-text-muted text-sm">
        The page you are looking for does not exist or may have moved.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="ui-btn-base ui-btn-primary rounded-lg px-4 py-2 text-sm font-medium"
        >
          Go to home
        </Link>
        <Link
          href="/apps"
          className="ui-btn-base ui-btn-secondary rounded-lg px-4 py-2 text-sm font-medium"
        >
          Browse apps
        </Link>
      </div>
    </main>
  );
}
