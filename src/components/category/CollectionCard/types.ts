export interface SubcategoryChip {
  id: string;
  name: string;
  slug?: string;
}

export interface CollectionCardProps {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  description?: string;
  subcategories?: SubcategoryChip[];
  className?: string;
  priority?: boolean;
}
