"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Heading = {
  id: string;
  text: string;
  level: number;
};

export function TableOfContents({ sections }: { sections?: { id: string, title: string, slug: string }[] }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (sections && sections.length > 0) {
      setHeadings(
        sections.map((s) => ({
          id: s.slug,
          text: s.title,
          level: 2,
        }))
      );
      return;
    }

    // Wait for markdown to render
    const timeout = setTimeout(() => {
      const elements = Array.from(document.querySelectorAll(".prose h2, .prose h3"));
      
      const parsedHeadings: Heading[] = elements.map((el) => {
        // Ensure element has an ID
        if (!el.id) {
          el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "";
        }
        return {
          id: el.id,
          text: el.textContent || "",
          level: el.tagName === "H2" ? 2 : 3,
        };
      }).filter(h => h.id);

      setHeadings(parsedHeadings);
    }, 100);

    return () => clearTimeout(timeout);
  }, [sections]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            // Replace state to keep URL in sync without cluttering back button history
            if (window.history.replaceState) {
              window.history.replaceState(null, '', `#${entry.target.id}`);
            }
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
        On this page
      </h3>
      <nav>
        <ul className="space-y-2.5">
          {headings.map((heading) => (
            <li 
              key={heading.id} 
              className={cn(
                heading.level === 3 && "pl-4"
              )}
            >
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block text-sm transition-colors",
                  activeId === heading.id
                    ? "text-brand-primary font-medium"
                    : "text-text-muted hover:text-text-primary"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
                  setActiveId(heading.id);
                  if (window.history.pushState) {
                    window.history.pushState(null, '', `#${heading.id}`);
                  }
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
