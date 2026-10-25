import type { Metadata } from "next";
import { JsonLd } from "components/seo";
import { NOT_FOUND_METADATA, productJsonLd, productMetadata, seoApi } from "lib/seo";
import ProductDetailPage from "./ProductDetailPage";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await seoApi.product(id);
  if (!product || !product.isActive) return NOT_FOUND_METADATA("Product not found");
  return productMetadata(product);
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const [product, domains, categories] = await Promise.all([
    seoApi.product(id),
    seoApi.domains(),
    seoApi.categories(),
  ]);

  const showJsonLd = product && product.isActive;
  const currency = domains?.find((d) => d._id === product?.domainId)?.currency || "GBP";
  const category = categories?.find((c) => c._id === product?.categoryId);

  return (
    <>
      {showJsonLd && <JsonLd data={productJsonLd(product, currency, category)} />}
      <ProductDetailPage
        initialProduct={showJsonLd ? product : null}
        initialCategories={categories}
        initialDomains={domains}
      />
    </>
  );
}
