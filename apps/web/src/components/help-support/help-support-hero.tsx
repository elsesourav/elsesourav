type HelpSupportHeroProps = {
  title?: string;
  subtitle?: string;
};

export function HelpSupportHero({
  title = "How can we help?",
  subtitle = "Search for articles, browse our comprehensive guides, or contact our support team directly.",
}: HelpSupportHeroProps) {
  return (
    <div className="flex flex-col items-center justify-start pt-8 md:pt-16 text-center space-y-4 px-4 h-full relative z-20">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary drop-shadow-md">
        {title}
      </h1>
      <p className="text-base md:text-lg text-text-primary max-w-lg leading-relaxed font-medium drop-shadow-sm">
        {subtitle}
      </p>
    </div>
  );
}
