import { Button } from "@/components/ui/button";
import { Code, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CreatorIdentity() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-surface-base border border-border-subtle p-8 md:p-12 lg:p-16">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12 items-center">
        <div className="shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-bg-base shadow-xl">
            {/* Fallback to a solid color or default avatar if user doesn't have an image */}
            <div className="w-full h-full bg-brand-primary/20 flex items-center justify-center text-4xl font-bold text-brand-primary">
              SB
            </div>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary">
              Handcrafted by Sourav Barui
            </h2>
            <p className="text-text-secondary font-medium uppercase tracking-widest text-xs">
              Software Engineer & Designer
            </p>
          </div>
          
          <p className="text-text-primary max-w-2xl leading-relaxed">
            I build fast, accessible, and beautiful web applications. Explore my curated selection of tools, read my technical insights, or reach out to collaborate on your next big project.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
            <Button asChild variant="default" className="rounded-full shadow-md">
              <Link href="/about">
                Read my story
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="rounded-full text-text-muted hover:text-brand-primary">
                <a href="https://github.com/elsesourav" target="_blank" rel="noopener noreferrer">
                  <Code className="w-5 h-5" />
                  <span className="sr-only">GitHub</span>
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="rounded-full text-text-muted hover:text-blue-500">
                <a href="https://twitter.com/elsesourav" target="_blank" rel="noopener noreferrer">
                  <Globe className="w-5 h-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
