"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ukAddressService, type UkAddressResult } from "utility/services";
import { SearchIcon, MapPinIcon } from "components/icons";
import styles from "./UkAddressAutocomplete.module.css";

export interface UkAddressAutocompleteProps {
  onSelectAddress: (address: UkAddressResult) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  initialQuery?: string;
}

export const UkAddressAutocomplete: React.FC<UkAddressAutocompleteProps> = ({
  onSelectAddress,
  placeholder = "Search UK street, postcode or town (e.g. 10 Downing St or SW1A 1AA)...",
  id = "uk-address-autocomplete",
  disabled = false,
  className = "",
  initialQuery = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<UkAddressResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
      setError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const data = await ukAddressService.search(trimmed, abortController.signal);
      setResults(data);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : "Could not load address suggestions. You can enter your address manually."
      );
      setResults([]);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length < 3) {
      setResults([]);
      setIsOpen(false);
      setError(null);
      setLoading(false);
      return;
    }

    // 450ms debounce
    debounceTimerRef.current = setTimeout(() => {
      performSearch(val);
    }, 450);
  };

  const handleSelect = (address: UkAddressResult) => {
    setQuery(address.displayName);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelectAddress(address);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setError(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" && results.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          handleSelect(results[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`${styles.wrapper} ${className}`}>
      <div className={styles.searchBar}>
        <div className={styles.searchIcon}>
          <SearchIcon size={18} />
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0 || error) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-dropdown`}
          className={styles.input}
        />
        <div className={styles.trailingActions}>
          {loading && <div className={styles.spinner} role="status" aria-label="Loading addresses" />}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className={styles.clearButton}
              aria-label="Clear address search"
              title="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div id={`${id}-dropdown`} className={styles.dropdown} role="listbox">
          {loading && results.length === 0 && (
            <div className={styles.statusMessage}>
              <div className={styles.spinner} style={{ width: 22, height: 22 }} />
              <span className={styles.statusTitle}>Searching UK addresses...</span>
            </div>
          )}

          {error && (
            <div className={styles.statusMessage}>
              <span className={`${styles.statusTitle} ${styles.errorTitle}`}>Notice</span>
              <span className={styles.statusDesc}>{error}</span>
            </div>
          )}

          {!loading && !error && results.length === 0 && query.trim().length >= 3 && (
            <div className={styles.statusMessage}>
              <span className={styles.statusTitle}>No matching UK address found</span>
              <span className={styles.statusDesc}>
                Try typing a postcode, or enter your address details directly in the fields below.
              </span>
            </div>
          )}

          {results.length > 0 && (
            <ul className={styles.resultsList}>
              {results.map((item, idx) => {
                const isActive = idx === activeIndex;
                const secondary = [item.city, item.county].filter(Boolean).join(", ");
                return (
                  <li
                    key={item.id}
                    id={`${id}-opt-${idx}`}
                    role="option"
                    aria-selected={isActive}
                    className={`${styles.resultItem} ${isActive ? styles.resultItemActive : ""}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <div className={styles.pinIcon}>
                      <MapPinIcon size={14} />
                    </div>
                    <div className={styles.resultDetails}>
                      <div className={styles.primaryRow}>
                        <span className={styles.primaryText}>{item.line1 || item.displayName}</span>
                        {item.postalCode && (
                          <span className={styles.postcodeBadge}>{item.postalCode}</span>
                        )}
                      </div>
                      {secondary && <span className={styles.secondaryText}>{secondary}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className={styles.attributionFooter}>
            <span className={styles.ukBadge}>🇬🇧 United Kingdom</span>
            <span>
              Search via{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer noopener"
                className={styles.attributionLink}
              >
                OpenStreetMap
              </a>{" "}
              &amp; Postcodes.io
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
