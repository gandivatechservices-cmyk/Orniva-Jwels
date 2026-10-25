import type { Metadata } from "next";
import { ProductsView } from "../../../components/products/ProductsView";
import { NOT_FOUND_METADATA, categoryMetadata, seoApi } from "lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const clean = decodeURIComponent(slug).trim().toLowerCase();
  const categories = await seoApi.categories();
  const category = categories?.find((c) => c.slug.toLowerCase() === clean || c._id === slug);
  if (!category) return NOT_FOUND_METADATA("Category not found");
  return categoryMetadata(category);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  return <ProductsView initialCategorySlug={slug} />;
}
