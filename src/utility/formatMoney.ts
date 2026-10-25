export function formatPrice(amount: number, currency?: string | null): string {
  const safeCurrency = currency && currency.trim().length === 3 ? currency.toUpperCase() : "GBP";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: safeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const formatMoney = formatPrice;
