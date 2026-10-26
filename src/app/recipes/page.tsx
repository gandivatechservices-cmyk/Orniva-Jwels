"use client";

import { useMemo, useState } from "react";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { TopContentCard } from "../../components/common/TopContentCard";
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
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(36px, 4vw, 56px)", paddingBottom: "80px", width: "100%" }}>
        <TopContentCard
          eyebrow="CULINARY & LIFESTYLE"
          title="Recipes & Pairing Guides"
          subtitle="Discover chef-tested recipes and lifestyle pairing ideas. Explore handcrafted inspirations for your table and home."
          image={IMAGES.recipes.healthyLunch}
          imageAlt="Recipes and Pairings"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Recipes" },
          ]}
          badge={
            <span className={styles.countBadge}>
              {filteredRecipes.length} {filteredRecipes.length === 1 ? "Guide" : "Guides"}
            </span>
          }
          ariaLabel="Recipes and Pairing Guides"
        />

        <Container>
          <div className={styles.container}>
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
      </div>
    </StoreLayout>
  );
}
