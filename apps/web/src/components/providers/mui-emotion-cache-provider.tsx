"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { useServerInsertedHTML } from "next/navigation";
import { useState, type ReactNode } from "react";

type MuiEmotionCacheProviderProps = {
  children: ReactNode;
};

type EmotionCacheState = {
  cache: ReturnType<typeof createCache>;
  flush: () => string[];
};

function createEmotionCacheState(): EmotionCacheState {
  const cache = createCache({ key: "mui" });
  cache.compat = true;

  const prevInsert = cache.insert;
  let inserted: string[] = [];

  cache.insert = (...args) => {
    const serialized = args[1];

    if (cache.inserted[serialized.name] === undefined) {
      inserted.push(serialized.name);
    }

    return prevInsert(...args);
  };

  const flush = () => {
    const names = inserted;
    inserted = [];
    return names;
  };

  return { cache, flush };
}

export function MuiEmotionCacheProvider({
  children,
}: MuiEmotionCacheProviderProps) {
  const [{ cache, flush }] = useState(createEmotionCacheState);

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }

    let styles = "";

    for (const name of names) {
      const style = cache.inserted[name];
      if (typeof style === "string") {
        styles += style;
      }
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
