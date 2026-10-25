import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";

export type BackendCartItem = {
  _id: string;
  productId: string;
  variantId: string;
  domainId?: string;
  categoryId?: string;
  name?: string;
  brand?: string;
  price?: number;
  mrp?: number;
  currency?: string;
  image?: string;
  quantity: number;
  bonusQty?: number;
  stock?: number;
  variantLabel?: string;
};

export type BackendCart = {
  _id: string;
  userId: string;
  items: BackendCartItem[];
};

const unwrap = async <T>(request: Promise<ApiResponse<T>>) => (await request).data;

let cartInFlight: Promise<BackendCart> | null = null;
let lastCartTime = 0;
let lastCartResult: BackendCart | null = null;

export const cartService = {
  getCart: (): Promise<BackendCart> => {
    if (cartInFlight) {
      return cartInFlight;
    }
    const now = Date.now();
    if (lastCartResult && now - lastCartTime < 1500) {
      return Promise.resolve(lastCartResult);
    }
    const promise = unwrap(apiClient.get<ApiResponse<BackendCart>>(API_ENDPOINTS.CART.BASE))
      .then((data) => {
        lastCartResult = data;
        lastCartTime = Date.now();
        cartInFlight = null;
        return data;
      })
      .catch((err) => {
        cartInFlight = null;
        throw err;
      });
    cartInFlight = promise;
    return promise;
  },
  addItem: (payload: { productId: string; variantId: string; quantity: number }) => {
    cartInFlight = null;
    lastCartResult = null;
    return unwrap(apiClient.post<ApiResponse<BackendCart>>(API_ENDPOINTS.CART.ITEMS, payload));
  },
  updateItem: (variantId: string, quantity: number) => {
    cartInFlight = null;
    lastCartResult = null;
    return unwrap(apiClient.patch<ApiResponse<BackendCart>>(API_ENDPOINTS.CART.ITEM_BY_VARIANT(variantId), { quantity }));
  },
  removeItem: (variantId: string) => {
    cartInFlight = null;
    lastCartResult = null;
    return unwrap(apiClient.delete<ApiResponse<BackendCart>>(API_ENDPOINTS.CART.ITEM_BY_VARIANT(variantId)));
  },
  clearCart: () => {
    cartInFlight = null;
    lastCartResult = null;
    return unwrap(apiClient.delete<ApiResponse<BackendCart>>(API_ENDPOINTS.CART.BASE));
  },
};
