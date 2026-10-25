export type SortValue = "featured" | "price-asc" | "price-desc" | "name-asc" | "newest";

export interface SortOption {
  label: string;
  value: string;
}

export interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
  options?: SortOption[];
  className?: string;
}
