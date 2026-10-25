import type { Category, Domain, Product } from "utility/services/catalog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6100/api";

/** Server-side GET against the catalog API. Returns null on any failure so builds never break. */
async function apiGet<T>(path: string, revalidate = 3600): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return (payload?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export const seoApi = {
  product: (id: string) => apiGet<Product>(`/products/${encodeURIComponent(id)}`),
  categories: () => apiGet<Category[]>("/categories"),
  domains: () => apiGet<Domain[]>("/domains"),
  products: (page: number, limit: number) =>
    apiGet<{ items: Product[]; total: number }>(`/products?page=${page}&limit=${limit}`),
};
