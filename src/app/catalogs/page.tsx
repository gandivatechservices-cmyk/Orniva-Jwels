"use client";

import { useEffect, useMemo, useState } from "react";
import { StoreLayout } from "../../components/StoreLayout";
import { Container } from "../../components/layout/Container";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { PromoBanner } from "../../components/promotional";
import { catalogService, type Catalog, type Product } from "../../utility/services";
import { buildCatalogShowcase, showcaseStyle } from "../../utility/catalogShowcase";
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
      <Container>
        <div className={styles.pageStack}>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Catalogs" }]} />
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h1 className={styles.sectionTitle}>All Catalogs</h1>
              <p className={styles.sectionSubtitle}>
                {loading ? "Loading..." : `${showcase.length} catalog${showcase.length === 1 ? "" : "s"} to explore`}
              </p>
            </div>
          </div>

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
    </StoreLayout>
  );
}
