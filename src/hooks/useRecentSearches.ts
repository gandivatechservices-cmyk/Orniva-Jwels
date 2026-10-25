"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "shopper_recent_searches";
const MAX_RECENT_SEARCHES = 8;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const addSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      // Remove any existing case-insensitive duplicate and push to top
      const next = [
        trimmed,
        ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota/access errors
      }

      return next;
    });
  }, []);

  const removeSearch = useCallback((termToRemove: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter(
        (item) => item.toLowerCase() !== termToRemove.toLowerCase()
      );

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore errors
      }

      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors
    }
  }, []);

  return {
    recentSearches,
    isLoaded,
    addSearch,
    removeSearch,
    clearAll,
  };
}
