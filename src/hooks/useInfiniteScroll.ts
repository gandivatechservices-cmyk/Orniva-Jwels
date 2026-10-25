import { useEffect, useRef, useCallback } from "react";

export interface UseInfiniteScrollOptions {
  /** Callback invoked when the sentinel element intersects the viewport */
  onLoadMore: () => void | Promise<void>;
  /** Whether more data is available to fetch */
  hasMore: boolean;
  /** Whether a fetch is currently in progress */
  isLoading: boolean;
  /** Distance from the viewport bottom to trigger the callback early (default: "300px") */
  rootMargin?: string;
  /** Intersection threshold (default: 0.1) */
  threshold?: number;
  /** Disable the observer completely */
  disabled?: boolean;
}

/**
 * Robust, production-ready hook for virtualization / infinite scrolling using IntersectionObserver.
 * - Prevents unwanted / duplicate API calls via guard locks.
 * - Triggers smoothly before reaching bottom via customizable rootMargin.
 * - Cleans up listeners reliably on unmount or when hasMore becomes false.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = "300px",
  threshold = 0.05,
  disabled = false,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(isLoading);
  const hasMoreRef = useRef(hasMore);
  const callbackRef = useRef(onLoadMore);

  // Keep ref values up to date without triggering effect re-subscriptions
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    callbackRef.current = onLoadMore;
  }, [onLoadMore]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry?.isIntersecting &&
        hasMoreRef.current &&
        !isLoadingRef.current &&
        !disabled
      ) {
        callbackRef.current();
      }
    },
    [disabled]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || disabled || !hasMore) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin,
      threshold,
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, rootMargin, threshold, disabled, hasMore]);

  return { sentinelRef };
}
