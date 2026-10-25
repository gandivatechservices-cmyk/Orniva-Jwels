"use client";

import { useState } from "react";
import { ordersService } from "../../../utility/services/orders";
import { downloadInvoicePdf } from "../../../utility/generateInvoicePdf";
import styles from "./DownloadInvoiceButton.module.css";

export interface DownloadInvoiceButtonProps {
  orderId: string;
  variant?: "outline" | "filled" | "compact";
  className?: string;
  label?: string;
}

/**
 * Reusable DownloadInvoiceButton component.
 * Fetches dynamic, verified invoice data from the backend single-source-of-truth API
 * and generates a high-fidelity PDF invoice for the customer or admin.
 */
export function DownloadInvoiceButton({
  orderId,
  variant = "outline",
  className,
  label = "Download Invoice",
}: DownloadInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoading(true);
      setError(null);
      const invoice = await ordersService.getInvoice(orderId);
      downloadInvoicePdf(invoice);
    } catch {
      setError("Unable to generate invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const variantClass =
    variant === "filled"
      ? styles.buttonFilled
      : variant === "compact"
      ? styles.buttonCompact
      : "";

  return (
    <div className={styles.wrapper}>
      <button
        id={`download-invoice-${orderId}`}
        onClick={handleDownload}
        disabled={loading}
        className={`${styles.button} ${variantClass} ${className || ""}`}
        title="Download official PDF invoice"
        aria-label="Download Invoice"
        type="button"
      >
        {loading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
        <span>{loading ? "Generating…" : label}</span>
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
