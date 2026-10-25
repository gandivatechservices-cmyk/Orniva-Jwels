"use client";

import type { ReactNode } from "react";
import { Skeleton } from "../../ui/Skeleton";
import { EmptyState } from "../../ui/EmptyState";
import type { DataTableColumn, DataTableProps } from "./types";
import styles from "./DataTable.module.css";

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  sortKey,
  sortOrder = "asc",
  onSort,
  loading = false,
  emptyText = "No records found.",
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  const getKey = (row: T, index: number): string => {
    if (typeof keyField === "function") {
      return keyField(row);
    }
    return String(row[keyField] ?? index);
  };

  const renderCellContent = (row: T, col: DataTableColumn<T>, index: number): ReactNode => {
    if (col.render) {
      return col.render(row, index);
    }
    return String(row[col.key] ?? "");
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <Skeleton height="40px" variant="rectangular" />
          <Skeleton height="48px" variant="rectangular" />
          <Skeleton height="48px" variant="rectangular" />
          <Skeleton height="48px" variant="rectangular" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <EmptyState title="No items" description={emptyText} />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Desktop Table View */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const isSortable = Boolean(col.sortable && onSort);

                return (
                  <th
                    key={col.key}
                    className={`${styles.th} ${isSortable ? styles.sortable : ""}`}
                    style={{
                      textAlign: col.align || "left",
                      width: col.width,
                    }}
                    onClick={() => isSortable && onSort?.(col.key)}
                  >
                    <div
                      className={styles.thContent}
                      style={{
                        justifyContent:
                          col.align === "right"
                            ? "flex-end"
                            : col.align === "center"
                            ? "center"
                            : "flex-start",
                      }}
                    >
                      <span>{col.header}</span>
                      {isSortable && (
                        <span>
                          {isSorted ? (
                            <span className={styles.sortArrow}>
                              {sortOrder === "asc" ? "▲" : "▼"}
                            </span>
                          ) : (
                            <span className={styles.sortArrowInactive}>▲</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const rowKey = getKey(row, index);
              return (
                <tr
                  key={rowKey}
                  className={`${styles.tr} ${onRowClick ? styles.clickable : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={styles.td}
                      style={{ textAlign: col.align || "left" }}
                    >
                      {renderCellContent(row, col, index)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className={styles.mobileCards}>
        {data.map((row, index) => {
          const rowKey = getKey(row, index);
          return (
            <div
              key={rowKey}
              className={`${styles.mobileCard} ${onRowClick ? styles.clickable : ""}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className={styles.mobileRow}>
                    <span className={styles.mobileLabel}>
                      {col.mobileLabel || col.header}
                    </span>
                    <span className={styles.mobileValue}>
                      {renderCellContent(row, col, index)}
                    </span>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
