import HelpAndSupportIcon from "@/components/icons/HelpAndSupportIcon";

export function HelpSupportHero() {
  return (
    <section className="rounded-4xl border border-black/10 bg-[linear-gradient(135deg,#0d1b3f,#1f5ed4_55%,#8fb1f7)] p-6 text-white shadow-[0_24px_60px_-34px_rgba(20,23,31,0.95)] sm:p-8">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-white/70">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12">
          <HelpAndSupportIcon className="h-5 w-5 fill-white" />
        </span>
        Help & Support
      </div>
      <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl sm:leading-[1.05]">
        One place for answers, updates, and direct support.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-white/82 sm:text-base">
        Start with the help center, check product updates, or contact us for
        billing and technical requests.
      </p>
    </section>
  );
}
