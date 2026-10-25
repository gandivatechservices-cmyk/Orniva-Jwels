import Link from "next/link";
import { ChevronRightIcon } from "components/icons";
import type { BreadcrumbProps } from "./types";
import styles from "./Breadcrumb.module.css";

export function Breadcrumb({
  items,
  separator = <ChevronRightIcon size={12} className={styles.separatorIcon} />,
  className = "",
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`${styles.nav} ${className}`}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className={styles.item}>
              {index > 0 && <span className={styles.separator} aria-hidden="true">{separator}</span>}
              {isLast || !item.href ? (
                <span className={styles.current} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
