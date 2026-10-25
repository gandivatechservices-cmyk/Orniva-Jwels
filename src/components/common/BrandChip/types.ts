export interface BrandChipProps {
  id: string;
  name: string;
  logo?: string;
  itemCount?: number;
  isActive?: boolean;
  href?: string;
  onClick?: (id: string) => void;
  loading?: boolean;
  className?: string;
}
