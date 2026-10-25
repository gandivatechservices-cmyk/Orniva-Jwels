import type { ReactNode } from "react";

export interface RecipeCardProps {
  id: string;
  title: string;
  image: string;
  badgeIcon?: ReactNode;
  badgeBg?: string;
  badgeColor?: string;
  prepTime?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  servings?: number;
  tags?: string[];
  isPending?: boolean;
  loading?: boolean;
  onClick?: (id: string) => void;
  className?: string;
}

