import { ProductsView } from "../../components/products/ProductsView";
import { staticPageMetadata } from "lib/seo";

export const metadata = staticPageMetadata("products");

export default function ProductsPage() {
  return <ProductsView />;
}
