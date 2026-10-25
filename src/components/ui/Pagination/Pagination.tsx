import { ChevronLeftIcon, ChevronRightIcon } from "components/icons";
import type { PaginationProps } from "./types";
import styles from "./Pagination.module.css";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav aria-label="Pagination" className={`${styles.pagination} ${className}`}>
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        className={`${styles.pageBtn} ${styles.arrowBtn}`}
      >
        <ChevronLeftIcon size={16} />
      </button>

      <div className={styles.pageList}>
        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span key={`dots-${idx}`} className={styles.ellipsis}>
                …
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              type="button"
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`${styles.pageBtn} ${isActive ? styles.active : ""}`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        className={`${styles.pageBtn} ${styles.arrowBtn}`}
      >
        <ChevronRightIcon size={16} />
      </button>
    </nav>
  );
}
