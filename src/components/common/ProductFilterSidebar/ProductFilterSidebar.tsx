"use client";

import React, { memo, useState } from "react";
import { Checkbox } from "../../ui/Checkbox";
import { Switch } from "../../ui/Switch";
import { ChevronDownIcon } from "../../icons";
import styles from "./ProductFilterSidebar.module.css";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface ProductFilterSidebarProps {
  categoryOptions?: FilterOption[];
  brandOptions?: FilterOption[];
  priceBounds?: { min: number; max: number };
  priceRange?: [number, number];
  currency?: string;
  selectedCategories: string[];
  selectedBrands: string[];
  inStockOnly: boolean;
  offersOnly?: boolean;
  hasActiveFilters?: boolean;
  showCategoryFilter?: boolean;
  onCategoryChange: (values: string[]) => void;
  onBrandChange: (values: string[]) => void;
  onPriceRangeChange?: (range: [number, number]) => void;
  onInStockChange: (inStock: boolean) => void;
  onOffersChange?: (offers: boolean) => void;
  onResetFilters: () => void;
  onApplyFilters?: () => void;
  className?: string;
  // Legacy static range props (kept optional for backwards compatibility)
  priceOptions?: FilterOption[];
  selectedPriceRanges?: string[];
  onPriceChange?: (values: string[]) => void;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  searchable?: boolean;
  defaultOpen?: boolean;
  singleSelect?: boolean;
}

function FilterSection({
  title,
  options,
  selectedValues,
  onChange,
  searchable = false,
  defaultOpen = true,
  singleSelect = false,
}: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions =
    searchable && searchQuery.trim() !== ""
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

  const DISPLAY_LIMIT = 7;
  const visibleOptions =
    isExpanded || filteredOptions.length <= DISPLAY_LIMIT || searchQuery.trim() !== ""
      ? filteredOptions
      : filteredOptions.slice(0, DISPLAY_LIMIT);

  const handleToggle = (value: string) => {
    if (singleSelect) {
      if (selectedValues.includes(value)) {
        onChange([]);
      } else {
        onChange([value]);
      }
      return;
    }
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        <button
          type="button"
          className={styles.groupHeaderToggle}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <h4 className={styles.groupTitle}>{title}</h4>
        </button>

        <div className={styles.groupHeaderRight}>
          {selectedValues.length > 0 && (
            <button
              type="button"
              className={styles.groupClearBtn}
              onClick={handleClear}
              title={`Clear ${title}`}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            className={styles.chevronBtn}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
            aria-expanded={isOpen}
          >
            <ChevronDownIcon
              size={15}
              className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={styles.groupBody}>
          {searchable && options.length > 6 && (
            <div className={styles.searchWrapper}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={`Search ${title}`}
              />
            </div>
          )}

          <div className={styles.optionsList}>
            {visibleOptions.map((opt) => {
              const checked = selectedValues.includes(opt.value);
              return (
                <label key={opt.value} className={styles.optionItem}>
                  <span className={styles.optionLabelText}>
                    <Checkbox
                      checked={checked}
                      onChange={() => handleToggle(opt.value)}
                    />
                    <span>{opt.label}</span>
                  </span>
                  {opt.count !== undefined && (
                    <span className={styles.optionCount}>({opt.count})</span>
                  )}
                </label>
              );
            })}
          </div>

          {filteredOptions.length > DISPLAY_LIMIT && searchQuery.trim() === "" && (
            <button
              type="button"
              className={styles.showMoreBtn}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded
                ? "Show less"
                : `+${filteredOptions.length - DISPLAY_LIMIT} more`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface PriceRangeSectionProps {
  minLimit: number;
  maxLimit: number;
  value: [number, number];
  currency?: string;
  onChange: (val: [number, number]) => void;
  defaultOpen?: boolean;
}

function PriceRangeSection({
  minLimit,
  maxLimit,
  value,
  currency = "£",
  onChange,
  defaultOpen = true,
}: PriceRangeSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const effectiveMax = maxLimit > minLimit ? maxLimit : minLimit + 50;
  const currentMin = Math.max(minLimit, Math.min(value[0], effectiveMax));
  const currentMax = Math.min(effectiveMax, Math.max(value[1], minLimit));

  const rangeSpan = Math.max(1, effectiveMax - minLimit);
  const minPercent = Math.min(100, Math.max(0, ((currentMin - minLimit) / rangeSpan) * 100));
  const maxPercent = Math.min(100, Math.max(0, ((currentMax - minLimit) / rangeSpan) * 100));

  const isFiltered = currentMin > minLimit || currentMax < effectiveMax;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([minLimit, effectiveMax]);
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      const clamped = Math.max(minLimit, Math.min(val, currentMax));
      onChange([clamped, currentMax]);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) {
      const clamped = Math.min(effectiveMax, Math.max(val, currentMin));
      onChange([currentMin, clamped]);
    }
  };

  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        <button
          type="button"
          className={styles.groupHeaderToggle}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <h4 className={styles.groupTitle}>Price Range</h4>
        </button>

        <div className={styles.groupHeaderRight}>
          {isFiltered && (
            <button
              type="button"
              className={styles.groupClearBtn}
              onClick={handleClear}
              title="Reset price range"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            className={styles.chevronBtn}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Collapse price range" : "Expand price range"}
            aria-expanded={isOpen}
          >
            <ChevronDownIcon
              size={15}
              className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={styles.groupBody}>
          <div className={styles.priceRangePreview}>
            <span className={styles.priceTag}>
              {currency}{currentMin.toFixed(0)}
            </span>
            <span className={styles.priceRangeDivider}>to</span>
            <span className={styles.priceTag}>
              {currency}{currentMax.toFixed(0)}
            </span>
          </div>

          {/* Native Dual Range Slider with zero portal / effect dependencies */}
          <div className={styles.sliderContainer}>
            <div className={styles.sliderTrack}>
              <div
                className={styles.sliderHighlight}
                style={{
                  left: `${minPercent}%`,
                  width: `${Math.max(0, maxPercent - minPercent)}%`,
                }}
              />
            </div>
            <input
              type="range"
              min={minLimit}
              max={effectiveMax}
              step={1}
              value={currentMin}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), currentMax);
                onChange([val, currentMax]);
              }}
              className={styles.rangeThumb}
              aria-label="Minimum price slider"
            />
            <input
              type="range"
              min={minLimit}
              max={effectiveMax}
              step={1}
              value={currentMax}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), currentMin);
                onChange([currentMin, val]);
              }}
              className={styles.rangeThumb}
              aria-label="Maximum price slider"
            />
          </div>

          <div className={styles.priceInputRow}>
            <div className={styles.priceInputGroup}>
              <span className={styles.priceInputLabel}>Min</span>
              <div className={styles.priceInputBox}>
                <span className={styles.priceCurrency}>{currency}</span>
                <input
                  type="number"
                  className={styles.priceInput}
                  min={minLimit}
                  max={currentMax}
                  value={currentMin}
                  onChange={handleMinInputChange}
                  aria-label="Minimum price"
                />
              </div>
            </div>

            <div className={styles.priceInputDash}>—</div>

            <div className={styles.priceInputGroup}>
              <span className={styles.priceInputLabel}>Max</span>
              <div className={styles.priceInputBox}>
                <span className={styles.priceCurrency}>{currency}</span>
                <input
                  type="number"
                  className={styles.priceInput}
                  min={currentMin}
                  max={effectiveMax}
                  value={currentMax}
                  onChange={handleMaxInputChange}
                  aria-label="Maximum price"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const ProductFilterSidebar = memo(function ProductFilterSidebar({
  categoryOptions = [],
  brandOptions = [],
  priceBounds,
  priceRange,
  currency = "£",
  selectedCategories,
  selectedBrands,
  inStockOnly,
  offersOnly,
  hasActiveFilters,
  showCategoryFilter = true,
  onCategoryChange,
  onBrandChange,
  onPriceRangeChange,
  onInStockChange,
  onOffersChange,
  onResetFilters,
  onApplyFilters,
  className = "",
  // Legacy static range props
  priceOptions = [],
  selectedPriceRanges = [],
  onPriceChange,
}: ProductFilterSidebarProps) {
  return (
    <div className={`${styles.sidebarInner} ${className}`}>
      {/* Header */}
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.clearAllBtn}
            onClick={onResetFilters}
            aria-label="Clear all active filters"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Scrollable Filter Options Body */}
      <div className={styles.sidebarBody}>
        {/* In Stock Only Switch */}
        <div className={styles.filterSwitchRow}>
          <span className={styles.filterSwitchLabel}>In Stock Only</span>
          <Switch
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            aria-label="Filter in-stock products only"
          />
        </div>

        {/* Special Offers Switch */}
        {typeof onOffersChange === "function" && (
          <div className={styles.filterSwitchRow}>
            <span className={styles.filterSwitchLabel}>Special Offers</span>
            <Switch
              checked={Boolean(offersOnly)}
              onChange={(e) => onOffersChange(e.target.checked)}
              aria-label="Filter special offers only"
            />
          </div>
        )}

        {/* Categories Filter Group */}
        {showCategoryFilter && categoryOptions.length > 0 && (
          <FilterSection
            title="Categories"
            options={categoryOptions}
            selectedValues={selectedCategories}
            onChange={onCategoryChange}
            searchable
            defaultOpen={true}
          />
        )}

        {/* Brands Filter Group */}
        {brandOptions.length > 0 && (
          <FilterSection
            title="Brand"
            options={brandOptions}
            selectedValues={selectedBrands}
            onChange={onBrandChange}
            searchable
            defaultOpen={true}
          />
        )}

        {/* Dynamic Price Range Filter Group */}
        {priceBounds && priceRange && onPriceRangeChange ? (
          <PriceRangeSection
            minLimit={priceBounds.min}
            maxLimit={priceBounds.max}
            value={priceRange}
            currency={currency}
            onChange={onPriceRangeChange}
            defaultOpen={true}
          />
        ) : priceOptions.length > 0 && onPriceChange && selectedPriceRanges ? (
          <FilterSection
            title="Price"
            options={priceOptions}
            selectedValues={selectedPriceRanges}
            onChange={onPriceChange}
            defaultOpen={true}
          />
        ) : null}
      </div>

      {/* Fixed Bottom Footer with Reset and Apply Filters Button */}
      <div className={styles.sidebarFooter}>
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetFiltersBtn}
            onClick={onResetFilters}
            aria-label="Reset all filters"
          >
            Reset
          </button>
        )}
        <button
          type="button"
          className={styles.applyFiltersBtn}
          onClick={onApplyFilters}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
});
