"use client";

import { useMemo, useState } from "react";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { RecipeCard } from "../../components/common/RecipeCard";
import { SearchIcon } from "../../components/icons";
import { IMAGES } from "../../constants/images";
import styles from "./recipes.module.css";

const VERIFIED_RECIPES = [
  {
    id: "butter-chicken",
    title: "Butter Chicken",
    image: IMAGES.recipes.butterChicken,
    category: "Curries",
  },
  {
    id: "biryani",
    title: "Hyderabadi Biryani",
    image: IMAGES.recipes.biryani,
    category: "Rice Dishes",
  },
  {
    id: "pasta",
    title: "Italian Herb Pasta",
    image: IMAGES.recipes.pasta,
    category: "Quick Meals",
  },
  {
    id: "healthy-lunch",
    title: "Fresh Green Healthy Salad",
    image: IMAGES.recipes.healthyLunch,
    category: "Healthy",
  },
  {
    id: "mexican-night",
    title: "Mexican Fiesta Bowls",
    image: IMAGES.recipes.mexicanNight,
    category: "Dinner Ideas",
  },
];

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return VERIFIED_RECIPES;
    const q = searchQuery.toLowerCase().trim();
    return VERIFIED_RECIPES.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <StoreLayout>
      <Container>
        <div className={styles.container}>
          <div className={styles.breadcrumbRow}>
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Recipes" },
              ]}
            />
          </div>

          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>Recipes & Meal Ideas</h1>
                <span className={styles.countBadge}>
                  {filteredRecipes.length} {filteredRecipes.length === 1 ? "Recipe" : "Recipes"}
                </span>
              </div>
              <p className={styles.desc}>
                Discover chef-tested recipes made with fresh ingredients. Click any recipe to shop the exact grocery ingredients directly.
              </p>
            </div>

            <div className={styles.searchWrap}>
              <SearchIcon size={18} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search recipes (e.g. Biryani, Butter Chicken, Pasta)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search recipes"
              />
            </div>
          </div>

          {filteredRecipes.length === 0 ? (
            <EmptyState
              title="No recipes found"
              description={`We couldn't find any recipes matching "${searchQuery}".`}
              action={
                <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
              }
            />
          ) : (
            <div className={styles.grid}>
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  id={recipe.id}
                  title={recipe.title}
                  image={recipe.image}
                  href={`/products?recipe=${encodeURIComponent(recipe.id)}`}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </StoreLayout>
  );
}
