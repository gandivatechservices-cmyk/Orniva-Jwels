/**
 * generateInvoicePdf
 * Pure-browser PDF generation using the Canvas API.
 * No external libraries needed — draws directly onto a canvas, then converts to PDF
 * using the browser's print-to-PDF capability via a hidden iframe.
 *
 * We build the PDF as an HTML document rendered inside a hidden iframe and trigger
 * the browser's native print dialog in "save as PDF" mode.
 */

import type { InvoiceData } from "utility/services/orders";

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function buildInvoiceHtml(invoice: InvoiceData, appName: string): string {
  const fmt = (n: number) => formatCurrency(n, invoice.currency);
  const addr = invoice.shippingAddress;
  const addressLines = [
    addr.line1,
    addr.line2,
    addr.city,
    addr.state,
    addr.postalCode,
    addr.country,
  ]
    .filter(Boolean)
    .join(", ");

  const paymentMethodLabel =
    invoice.paymentMethod === "cod" ? "Cash on Delivery" : "Card Payment (Stripe)";

  const itemRows = invoice.items
    .map((item) => {
      const attrs = Object.entries(item.attributes || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · ");
      return `
      <tr>
        <td class="item-cell">
          <div class="item-name">${item.name}</div>
          ${attrs ? `<div class="item-attrs">${attrs}</div>` : ""}
          ${item.sku ? `<div class="item-sku">SKU: ${item.sku}</div>` : ""}
          ${item.freeQty > 0 ? `<div class="item-free">Includes ${item.freeQty} free unit(s)</div>` : ""}
        </td>
        <td class="text-center">${item.paidQty}</td>
        <td class="text-right">${fmt(item.price)}</td>
        <td class="text-right bold">${fmt(item.lineTotal)}</td>
      </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #1a1a2e; background: #fff; font-size: 13px; line-height: 1.5; }
    .page { max-width: 780px; margin: 0 auto; padding: 48px 48px; }

    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 28px; border-bottom: 2px solid #e0e0ec; }
    .brand-name { font-size: 24px; font-weight: 800; letter-spacing: -0.03em; color: #024830; }
    .brand-tagline { font-size: 11px; color: #9b9bb0; margin-top: 2px; }
    .invoice-title { text-align: right; }
    .invoice-word { font-size: 28px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.02em; }
    .invoice-number { font-size: 13px; color: #9b9bb0; margin-top: 4px; }

    /* Meta grid */
    .meta-section { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: 28px 0; }
    .meta-block h3 { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #9b9bb0; margin-bottom: 8px; }
    .meta-block p { font-size: 13px; color: #1a1a2e; line-height: 1.7; }
    .meta-block .label { font-weight: 600; }

    /* Details row */
    .details-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #f8f8fb; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px; }
    .detail-cell h4 { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9b9bb0; margin-bottom: 4px; }
    .detail-cell p { font-size: 13px; font-weight: 600; color: #1a1a2e; }

    /* Table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    thead tr { background: #024830; }
    thead th { padding: 10px 12px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; color: #fff; text-align: left; }
    thead th.text-right { text-align: right; }
    thead th.text-center { text-align: center; }
    tbody tr { border-bottom: 1px solid #f0f0f0; }
    tbody tr:hover { background: #fafafa; }
    td { padding: 10px 12px; vertical-align: top; }
    .item-cell { width: 50%; }
    .item-name { font-weight: 600; font-size: 13px; color: #1a1a2e; }
    .item-attrs { font-size: 11px; color: #9b9bb0; margin-top: 2px; }
    .item-sku { font-size: 10px; color: #c0c0cf; margin-top: 2px; }
    .item-free { font-size: 10px; color: #024830; font-weight: 600; margin-top: 2px; }
    .text-center { text-align: center; color: #4a4a6a; }
    .text-right { text-align: right; color: #4a4a6a; }
    .bold { font-weight: 700; color: #1a1a2e; }

    /* Totals */
    .totals-section { display: flex; justify-content: flex-end; margin-top: 0; }
    .totals-table { width: 280px; }
    .totals-table tr td { padding: 5px 12px; font-size: 13px; }
    .totals-table tr td:last-child { text-align: right; font-weight: 600; }
    .totals-table tr.divider td { border-top: 1px solid #e0e0ec; padding-top: 10px; }
    .totals-table tr.grand td { font-size: 16px; font-weight: 800; color: #1a1a2e; padding-top: 6px; }
    .totals-table tr.grand td:last-child { color: #024830; }
    .discount-val { color: #024830; }

    /* Footer */
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0ec; display: flex; justify-content: space-between; align-items: center; }
    .footer-note { font-size: 11px; color: #9b9bb0; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: #dcfce7; color: #024830; }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 20px; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="brand-name">${appName}</div>
        <div class="brand-tagline">Order Invoice</div>
      </div>
      <div class="invoice-title">
        <div class="invoice-word">INVOICE</div>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
      </div>
    </div>

    <!-- Meta Grid: Bill To + Order Info -->
    <div class="meta-section">
      <div class="meta-block">
        <h3>Bill To</h3>
        <p class="label">${invoice.customer.name}</p>
        <p>${invoice.customer.email}</p>
        <p style="margin-top:8px;">${addressLines}</p>
      </div>
      <div class="meta-block" style="text-align:right;">
        <h3>Invoice Details</h3>
        <p><span style="color:#9b9bb0;">Invoice No:</span> ${invoice.invoiceNumber}</p>
        <p><span style="color:#9b9bb0;">Order Ref:</span> #${invoice.orderRef}</p>
        <p><span style="color:#9b9bb0;">Order Date:</span> ${formatDate(invoice.orderDate)}</p>
        <p><span style="color:#9b9bb0;">Issued:</span> ${formatDate(invoice.issuedDate)}</p>
      </div>
    </div>

    <!-- Details Row -->
    <div class="details-row">
      <div class="detail-cell">
        <h4>Payment Method</h4>
        <p>${paymentMethodLabel}</p>
      </div>
      <div class="detail-cell">
        <h4>Currency</h4>
        <p>${invoice.currency.toUpperCase()}</p>
      </div>
      <div class="detail-cell">
        <h4>Order Status</h4>
        <p style="text-transform:capitalize;">${invoice.status}</p>
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th class="text-center">Qty</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-section">
      <table class="totals-table">
        <tr>
          <td style="color:#9b9bb0;">Subtotal</td>
          <td>${fmt(invoice.subtotal)}</td>
        </tr>
        ${invoice.discountAmount > 0 ? `
        <tr>
          <td style="color:#9b9bb0;">Discount${invoice.couponCode ? ` (${invoice.couponCode})` : ""}</td>
          <td class="discount-val">−${fmt(invoice.discountAmount)}</td>
        </tr>` : ""}
        <tr>
          <td style="color:#9b9bb0;">Delivery Fee</td>
          <td>${(invoice.deliveryFee === 0 || invoice.deliveryFee === undefined) ? "FREE" : fmt(invoice.deliveryFee)}</td>
        </tr>
        <tr class="divider grand">
          <td>Total</td>
          <td>${fmt(invoice.total)}</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-note">
        Thank you for your order. For questions, please contact support.<br />
        This is a computer-generated invoice and requires no signature.
      </div>
      <div>
        <div class="status-badge">PAID</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Opens an offscreen iframe, writes the invoice HTML into it, and triggers the browser's
 * native print dialog (allowing saving as PDF with high fidelity).
 * Falls back to a popup window if iframe print is restricted.
 */
export function downloadInvoicePdf(invoice: InvoiceData, appName = "Atlassone"): void {
  const html = buildInvoiceHtml(invoice, appName);
  const iframe = document.createElement("iframe");

  // Keep dimensions realistic so flexbox/typography calculates exact printable layout
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "1024px";
  iframe.style.height = "768px";
  iframe.style.border = "none";
  iframe.style.opacity = "0.001";
  iframe.style.pointerEvents = "none";
  iframe.style.zIndex = "-9999";

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2500);
  };

  const triggerPrint = () => {
    try {
      const win = iframe.contentWindow;
      if (win) {
        win.focus();
        win.print();
        cleanup();
        return;
      }
    } catch (err) {
      console.warn("Iframe print was blocked or failed, attempting popup fallback:", err);
    }

    // Fallback: Open print-ready tab if iframe print is blocked
    try {
      const printWin = window.open("", "_blank");
      if (printWin) {
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
        setTimeout(() => {
          printWin.focus();
          printWin.print();
        }, 350);
      }
    } catch (fallbackErr) {
      console.error("Print fallback failed:", fallbackErr);
    } finally {
      cleanup();
    }
  };

  // Wait 350ms for fonts and styles to compute before invoking print
  setTimeout(triggerPrint, 350);
}
