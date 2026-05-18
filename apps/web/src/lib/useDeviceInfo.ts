import { useEffect, useState } from "react";

export function useDeviceInfo() {
  const [isMac, setIsMac] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }

    const platform = navigator.platform || "";
    setIsMac(/mac|iphone|ipad|ipod/i.test(platform));
    setIsTouch(
      (navigator as any).maxTouchPoints > 0 || "ontouchstart" in window,
    );
    const m = window.matchMedia("(max-width: 767px)");
    setIsMobile(m.matches);

    const onChange = () => setIsMobile(m.matches);
    try {
      m.addEventListener("change", onChange);
    } catch {
      m.addListener(onChange);
    }

    return () => {
      try {
        m.removeEventListener("change", onChange);
      } catch {
        m.removeListener(onChange);
      }
    };
  }, []);

  return {
    isMac,
    isMobile,
    isTouch,
  } as const;
}
