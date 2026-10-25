import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";
import type { Product } from "utility/services/catalog";

export type BackendWishlist = { _id: string; userId: string; items: Product[] };

const unwrap = async <T>(request: Promise<ApiResponse<T>>) => (await request).data;

export const wishlistService = {
  getWishlist: () => unwrap(apiClient.get<ApiResponse<BackendWishlist>>(API_ENDPOINTS.WISHLIST.BASE)),
  addItem: (productId: string) => unwrap(apiClient.post<ApiResponse<BackendWishlist>>(API_ENDPOINTS.WISHLIST.ITEMS, { productId })),
  removeItem: (productId: string) => unwrap(apiClient.delete<ApiResponse<BackendWishlist>>(API_ENDPOINTS.WISHLIST.ITEM_BY_PRODUCT(productId))),
};
