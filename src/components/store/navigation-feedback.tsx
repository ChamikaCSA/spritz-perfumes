"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function NavigationFeedbackInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationKey = `${pathname}?${searchParams.toString()}`;
  const [pending, setPending] = useState(false);
  const [seenLocation, setSeenLocation] = useState(locationKey);

  if (seenLocation !== locationKey) {
    setSeenLocation(locationKey);
    setPending(false);
  }

  useEffect(() => {
    document.documentElement.classList.toggle("nav-pending", pending);
    return () => document.documentElement.classList.remove("nav-pending");
  }, [pending]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      setPending(true);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

export function NavigationFeedback() {
  return (
    <Suspense fallback={null}>
      <NavigationFeedbackInner />
    </Suspense>
  );
}
