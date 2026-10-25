import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "components/icons";
import { Container, type ContainerSize } from "../Container";
import styles from "./Section.module.css";

export type SectionProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  viewAllHref?: string;
  viewAllText?: string;
  onViewAll?: () => void;
  containerSize?: ContainerSize;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function Section({
  title,
  subtitle,
  viewAllHref,
  viewAllText = "View All",
  onViewAll,
  containerSize = "default",
  children,
  className = "",
  id,
}: SectionProps) {
  const hasHeader = title || viewAllHref || onViewAll;

  return (
    <section id={id} className={`${styles.section} ${className}`}>
      <Container size={containerSize}>
        {hasHeader && (
          <div className={styles.header}>
            <div className={styles.titleWrap}>
              {title && <h2 className={styles.title}>{title}</h2>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {viewAllHref ? (
              <Link href={viewAllHref} prefetch={false} className={styles.viewAll}>
                <span>{viewAllText}</span>
                <ChevronRightIcon size={14} />
              </Link>
            ) : onViewAll ? (
              <button type="button" onClick={onViewAll} className={styles.viewAll}>
                <span>{viewAllText}</span>
                <ChevronRightIcon size={14} />
              </button>
            ) : null}
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </Container>
    </section>
  );
}
