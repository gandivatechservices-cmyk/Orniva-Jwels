import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { ChevronDownIcon, CheckIcon, SearchIcon } from "components/icons";
import { useClickOutside } from "hooks";
import type { SelectOption, SelectProps } from "./types";
import styles from "./Select.module.css";

export function Select<T extends string = string>({
  options,
  value,
  defaultValue,
  onChange,
  placeholder = "Select an option...",
  label,
  error,
  helperText,
  disabled = false,
  size = "md",
  searchable = false,
  fullWidth = true,
  className = "",
  id,
}: SelectProps<T>) {
  const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const selectedValue = value !== undefined ? value : internalValue;
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const containerRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen) {
      setIsOpen(false);
      setSearchQuery("");
    }
  }, isOpen);

  const listboxRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = searchable && searchQuery
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const selectOption = useCallback((opt: SelectOption<T>) => {
    if (opt.disabled) return;
    if (value === undefined) {
      setInternalValue(opt.value);
    }
    onChange?.(opt.value);
    setIsOpen(false);
    setSearchQuery("");
  }, [value, onChange]);

  useEffect(() => {
    if (isOpen && searchable) {
      searchInputRef.current?.focus();
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll(`.${styles.option}`);
      const item = items[highlightedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement | HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
        const idx = options.findIndex((o) => o.value === selectedValue);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case "Home":
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setHighlightedIndex(filteredOptions.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          selectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
      case "Tab":
        setIsOpen(false);
        setSearchQuery("");
        break;
      default:
        if (!searchable && e.key.length === 1 && e.key.match(/[a-z0-9]/i)) {
          const char = e.key.toLowerCase();
          const matchIndex = options.findIndex((opt) => opt.label.toLowerCase().startsWith(char));
          if (matchIndex >= 0) {
            setHighlightedIndex(matchIndex);
          }
        }
        break;
    }
  };

  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : "select");

  return (
    <div ref={containerRef} className={`${styles.container} ${fullWidth ? styles.fullWidth : ""} ${className}`}>
      {label && (
        <label id={`${selectId}-label`} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.wrapper}>
        <button
          type="button"
          id={selectId}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${selectId}-label ${selectId}` : undefined}
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`
            ${styles.trigger}
            ${styles[size]}
            ${isOpen ? styles.open : ""}
            ${error ? styles.hasError : ""}
            ${disabled ? styles.disabled : ""}
          `}
        >
          <span className={`${styles.valueText} ${!selectedOption ? styles.placeholder : ""}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className={`${styles.chevron} ${isOpen ? styles.chevronRotated : ""}`}>
            <ChevronDownIcon size={16} />
          </span>
        </button>

        {isOpen && (
          <div className={styles.dropdown} role="presentation">
            {searchable && (
              <div className={styles.searchBox}>
                <SearchIcon size={16} className={styles.searchIcon} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search..."
                  className={styles.searchInput}
                />
              </div>
            )}

            <ul
              ref={listboxRef}
              role="listbox"
              id={`${selectId}-listbox`}
              aria-labelledby={label ? `${selectId}-label` : undefined}
              className={styles.listbox}
            >
              {filteredOptions.length === 0 ? (
                <li className={styles.emptyOption}>No options found</li>
              ) : (
                filteredOptions.map((opt, index) => {
                  const isSelected = opt.value === selectedValue;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <li
                      key={String(opt.value)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={opt.disabled}
                      onClick={() => selectOption(opt)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`
                        ${styles.option}
                        ${isSelected ? styles.selected : ""}
                        ${isHighlighted ? styles.highlighted : ""}
                        ${opt.disabled ? styles.disabledOption : ""}
                      `}
                    >
                      <span className={styles.optionLabel}>{opt.label}</span>
                      {opt.hint && <span className={styles.optionHint}>{opt.hint}</span>}
                      {isSelected && (
                        <span className={styles.checkIcon}>
                          <CheckIcon size={16} />
                        </span>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
      {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}
