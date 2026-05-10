"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initMixpanel, trackPageView } from "@/lib/mixpanel";

/**
 * Client component that initialises Mixpanel once and tracks page views.
 * Rendered inside RootLayout so it wraps every page.
 */
export default function MixpanelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Initialise once on mount
  useEffect(() => {
    initMixpanel();
  }, []);

  // Track each navigation as a page view
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return <>{children}</>;
}
