"use client";

import { useEffect, useMemo, useState } from "react";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { TopContentCard } from "../../components/common/TopContentCard";
import { PromoBanner } from "../../components/promotional";
import { catalogService, type Catalog, type Product } from "../../utility/services";
import { buildCatalogShowcase, showcaseStyle } from "../../utility/catalogShowcase";
import { IMAGES } from "../../constants/images";
import styles from "../home.module.css";

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([catalogService.listCatalogs(), catalogService.listAllProducts()])
      .then(([c, p]) => {
        setCatalogs(c || []);
        setProducts(p || []);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load catalogs."))
      .finally(() => setLoading(false));
  }, []);

  const showcase = useMemo(() => buildCatalogShowcase(catalogs, products), [catalogs, products]);

  return (
    <StoreLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(36px, 4vw, 56px)", paddingBottom: "80px", width: "100%" }}>
        <TopContentCard
          eyebrow="SEASONAL CURATIONS"
          title="Jewellery Lookbooks & Catalogs"
          subtitle="Explore thematic fine jewellery lookbooks, seasonal high jewellery catalogs, and bridal editions."
          image={IMAGES.jewelry.designerPromo}
          imageAlt="Jewellery Catalogs and Lookbooks"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Catalogs" },
          ]}
          badge={
            !loading ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#DFC08A",
                  backgroundColor: "rgba(167, 123, 63, 0.2)",
                  border: "1px solid rgba(167, 123, 63, 0.4)",
                  padding: "4px 14px",
                  borderRadius: "9999px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {showcase.length} {showcase.length === 1 ? "Catalog" : "Catalogs"} Available
              </span>
            ) : undefined
          }
          ariaLabel="Jewellery Catalogs"
        />

        <Container>
          <div className={styles.pageStack}>

          {error && <p role="alert">{error}</p>}
          {!loading && !error && showcase.length === 0 && <p>No catalogs available right now.</p>}

          <div className={styles.promoGrid}>
            {loading
              ? [0, 1].map((i) => <PromoBanner key={i} loading title="" />)
              : showcase.map(({ catalog, image, productCount }, index) => {
                  const look = showcaseStyle(index);
                  return (
                    <PromoBanner
                      key={catalog._id}
                      label={look.label}
                      title={catalog.name}
                      description={catalog.description || `${productCount} product${productCount === 1 ? "" : "s"} available.`}
                      buttonText={`Shop ${catalog.name}`}
                      href={`/catalogs/${catalog._id}`}
                      variant={look.variant}
                      image={image}
                      imageAlt={catalog.name}
                      imageFit="cover"
                    />
                  );
                })}
          </div>
        </div>
      </Container>
      </div>
    </StoreLayout>
  );
}
