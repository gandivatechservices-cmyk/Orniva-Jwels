import { useEffect, useRef } from "react";

export const ADMIN_SEARCH_EVENT = "admin-search";

export type AdminSearchIntent = { q: string; tab?: string };

/** Tells the admin page under the top bar what the user searched for (works whether or not the page is already open). */
export function emitAdminSearch(intent: AdminSearchIntent) {
  window.dispatchEvent(new CustomEvent<AdminSearchIntent>(ADMIN_SEARCH_EVENT, { detail: intent }));
}

/**
 * Calls `onIntent` when the page is opened with ?q=… (and optional ?tab=…) from the global search,
 * and again whenever a new global search happens while the page is already open.
 */
export function useAdminSearchIntent(onIntent: (intent: AdminSearchIntent) => void) {
  const latest = useRef(onIntent);
  useEffect(() => {
    latest.current = onIntent;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) latest.current({ q, tab: params.get("tab") || undefined });

    const handler = (event: Event) => latest.current((event as CustomEvent<AdminSearchIntent>).detail);
    window.addEventListener(ADMIN_SEARCH_EVENT, handler);
    return () => window.removeEventListener(ADMIN_SEARCH_EVENT, handler);
  }, []);
}
