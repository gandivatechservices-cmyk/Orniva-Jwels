import type { Metadata } from "next";
import { ProductsView } from "../../components/products/ProductsView";
import { NOT_FOUND_METADATA } from "lib/seo";

export const metadata: Metadata = NOT_FOUND_METADATA("Search");

export default function SearchPage() {
  return <ProductsView />;
}
