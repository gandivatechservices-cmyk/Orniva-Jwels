import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { cartService } from "utility/services/cart";
import { offersService, type CouponValidationResult } from "utility/services/offers";
import type { RootState } from "../store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type CartItem = {
  key: string;
  productId: string;
  variantId?: string;
  domainId: string;
  categoryId?: string;
  currency: string;
  name: string;
  variantLabel?: string;
  image?: string;
  price: number;
  /** Merchant-set list price (MRP), scaled to this variant — struck-through "was" price. */
  mrp?: number;
  qty: number;
  /** Extra free units auto-granted by a "Buy X Get Y free" offer, on top of `qty`. */
  bonusQty?: number;
  stock?: number;
};

type AddItemInput = Omit<CartItem, "qty" | "key"> & { key?: string };

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  couponCode: string | null;
  couponResult: CouponValidationResult | null;
  couponLoading: boolean;
}

function cartKey(productId: string, variantId?: string) {
  return `${productId}:${variantId || "base"}`;
}

const CART_STORAGE_KEY = "shopper-cart-items";

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch { }
}

const initialState: CartState = {
  items: [],
  hydrated: false,
  loading: false,
  error: null,
  couponCode: null,
  couponResult: null,
  couponLoading: false,
};

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------
export const applyCouponThunk = createAsyncThunk(
  "cart/applyCoupon",
  async (
    { code, items }: { code: string; items: CartItem[] },
    { rejectWithValue }
  ) => {
    if (items.length === 0) {
      return { code, result: { valid: false, reason: "no_eligible_items" } as CouponValidationResult };
    }
    try {
      const result = await offersService.validate({
        domainId: items[0].domainId,
        code,
        cartLines: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || item.productId,
          quantity: item.qty,
        })),
      });
      return { code, result };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Coupon validation failed.");
    }
  }
);

export const evaluateOffersThunk = createAsyncThunk(
  "cart/evaluateOffers",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const items = state.cart.items;
    if (items.length === 0) {
      return null;
    }
    const currentCode = state.cart.couponCode;
    try {
      const result = await offersService.validate({
        domainId: items[0].domainId,
        code: currentCode && currentCode !== "AUTO_OFFER" ? currentCode : undefined,
        cartLines: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || item.productId,
          quantity: item.qty,
        })),
      });
      return {
        code: result.valid ? (result.coupon?.code || currentCode || "AUTO_OFFER") : null,
        result,
      };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Offer evaluation failed.");
    }
  }
);

export const syncCartWithServerThunk = createAsyncThunk(
  "cart/syncWithServer",
  async (items: CartItem[], { rejectWithValue }) => {
    try {
      const backendCart = await cartService.getCart();
      const backendByVariant = new Map(backendCart.items.map((i) => [i.variantId, i]));
      const localVariantIds = new Set(
        items.filter((i) => i.variantId).map((i) => i.variantId!)
      );

      // Remove backend items that aren't in the local cart
      await Promise.all(
        backendCart.items
          .filter((i) => !localVariantIds.has(i.variantId))
          .map((i) => cartService.removeItem(i.variantId))
      );

      // Add / update items to match local cart
      for (const item of items) {
        if (!item.variantId) continue;
        const existing = backendByVariant.get(item.variantId);
        if (!existing) {
          await cartService.addItem({ productId: item.productId, variantId: item.variantId, quantity: item.qty });
        } else if (existing.quantity !== item.qty) {
          await cartService.updateItem(item.variantId, item.qty);
        }
      }
      return true;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to sync cart.");
    }
  }
);

export const fetchCartThunk = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const backendCart = await cartService.getCart();
      const mappedItems: CartItem[] = (backendCart.items || []).map((i) => ({
        key: cartKey(i.productId, i.variantId),
        productId: i.productId,
        variantId: i.variantId,
        domainId: i.domainId || "",
        categoryId: i.categoryId || undefined,
        currency: i.currency || "GBP",
        name: i.name || "Product",
        variantLabel: i.variantLabel,
        image: i.image,
        price: typeof i.price === "number" ? i.price : 0,
        mrp: typeof i.mrp === "number" ? i.mrp : undefined,
        qty: i.quantity,
        bonusQty: i.bonusQty ?? 0,
        stock: typeof i.stock === "number" ? i.stock : 99,
      }));
      return mappedItems;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load cart.");
    }
  },
  {
    condition: (_, { getState }) => {
      const state = getState() as RootState;
      if (state.cart.loading) {
        return false;
      }
      return true;
    },
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart(state) {
      if (state.hydrated) return;
      state.items = loadCartFromStorage();
      state.hydrated = true;
    },
    addItem(
      state,
      action: PayloadAction<{ item: AddItemInput; qty?: number; isAuthenticated: boolean }>
    ) {
      const { item, qty = 1, isAuthenticated } = action.payload;

      // Different domain guard
      if (state.items.length > 0 && state.items[0].domainId !== item.domainId) {
        throw new Error(
          "Your cart has items from a different store region. Clear your cart before adding items from another region."
        );
      }

      const variantId = item.variantId || (item as any).variants?.[0]?._id;
      const key = cartKey(item.productId, variantId);
      const existing = state.items.find((e) => e.key === key);
      let resolvedQty = qty;

      if (existing) {
        const nextQty = item.stock ? Math.min(existing.qty + qty, item.stock) : existing.qty + qty;
        resolvedQty = nextQty;
        existing.qty = nextQty;
      } else {
        resolvedQty = item.stock ? Math.min(qty, item.stock) : qty;
        state.items.push({ ...item, variantId, key, qty: resolvedQty });
      }

      state.couponCode = null;
      state.couponResult = null;
      saveCartToStorage(state.items);

      // Server sync for authenticated users
      if (isAuthenticated && variantId) {
        if (existing) {
          cartService
            .updateItem(variantId, resolvedQty)
            .catch((err) => console.error("[cart] Failed to sync update on add:", err));
        } else {
          cartService
            .addItem({ productId: item.productId, variantId, quantity: resolvedQty })
            .catch((err) => console.error("[cart] Failed to sync add:", err));
        }
      }
    },
    updateQty(
      state,
      action: PayloadAction<{ key: string; qty: number; isAuthenticated: boolean }>
    ) {
      const { key, qty, isAuthenticated } = action.payload;
      const entry = state.items.find((i) => i.key === key);
      if (!entry) return;

      const variantId = entry.variantId || (entry as any).variants?.[0]?._id;

      if (qty <= 0) {
        state.items = state.items.filter((i) => i.key !== key);
        state.couponCode = null;
        state.couponResult = null;
        saveCartToStorage(state.items);

        if (isAuthenticated && variantId) {
          cartService
            .removeItem(variantId)
            .catch((err) => console.error("[cart] Failed to sync remove on qty 0:", err));
        }
        return;
      }

      const nextQty = entry.stock ? Math.min(qty, entry.stock) : qty;
      entry.qty = nextQty;
      saveCartToStorage(state.items);

      if (isAuthenticated && variantId) {
        cartService
          .updateItem(variantId, nextQty)
          .catch((err) => console.error("[cart] Failed to sync update qty:", err));
      }
    },
    removeItem(
      state,
      action: PayloadAction<{ key: string; isAuthenticated: boolean }>
    ) {
      const { key, isAuthenticated } = action.payload;
      const entry = state.items.find((i) => i.key === key);
      state.items = state.items.filter((i) => i.key !== key);
      state.couponCode = null;
      state.couponResult = null;
      saveCartToStorage(state.items);

      if (isAuthenticated && entry?.variantId) {
        cartService
          .removeItem(entry.variantId)
          .catch((err) => console.error("[cart] Failed to sync remove:", err));
      }
    },
    clearCart(state, action: PayloadAction<{ isAuthenticated: boolean }>) {
      const { isAuthenticated } = action.payload;
      state.items = [];
      state.couponCode = null;
      state.couponResult = null;
      saveCartToStorage([]);

      if (isAuthenticated) {
        cartService
          .clearCart()
          .catch((err) => console.error("[cart] Failed to sync clear:", err));
      }
    },
    removeCoupon(state) {
      state.couponCode = null;
      state.couponResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyCouponThunk.pending, (state) => {
        state.couponLoading = true;
      })
      .addCase(applyCouponThunk.fulfilled, (state, action) => {
        state.couponLoading = false;
        state.couponCode = action.payload.code;
        state.couponResult = action.payload.result;
      })
      .addCase(applyCouponThunk.rejected, (state) => {
        state.couponLoading = false;
      })
      .addCase(evaluateOffersThunk.pending, (state) => {
        state.couponLoading = true;
      })
      .addCase(evaluateOffersThunk.fulfilled, (state, action) => {
        state.couponLoading = false;
        if (!action.payload) {
          state.couponCode = null;
          state.couponResult = null;
          return;
        }
        if (action.payload.result.valid) {
          state.couponCode = action.payload.code;
          state.couponResult = action.payload.result;
        } else if (state.couponCode && state.couponCode !== "AUTO_OFFER") {
          state.couponResult = action.payload.result;
        } else {
          state.couponCode = null;
          state.couponResult = null;
        }
      })
      .addCase(evaluateOffersThunk.rejected, (state) => {
        state.couponLoading = false;
      })
      .addCase(fetchCartThunk.pending, (state) => {
        if (!state.hydrated && state.items.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.hydrated = true;
        if (state.items.length > 0 && action.payload.length > 0) {
          const incomingByKey = new Map(action.payload.map((i) => [i.key, i]));
          const hasDiff =
            state.items.length !== action.payload.length ||
            state.items.some((item) => {
              const incoming = incomingByKey.get(item.key);
              return (
                !incoming ||
                incoming.qty !== item.qty ||
                incoming.bonusQty !== item.bonusQty ||
                incoming.price !== item.price
              );
            });
          if (hasDiff) {
            state.items = action.payload;
            saveCartToStorage(action.payload);
          }
        } else {
          state.items = action.payload;
          saveCartToStorage(action.payload);
        }
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load cart.";
        state.hydrated = true;
      });
  },
});

export const {
  hydrateCart,
  addItem,
  updateQty,
  removeItem,
  clearCart,
  removeCoupon,
} = cartSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartHydrated = (state: RootState) => state.cart.hydrated;
export const selectCartLoading = (state: RootState) => state.cart.loading;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectTotalItems = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.qty, 0);
export const selectTotalPrice = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.qty * item.price, 0);
export const selectCouponCode = (state: RootState) => state.cart.couponCode;
export const selectCouponResult = (state: RootState) => state.cart.couponResult;
export const selectCouponLoading = (state: RootState) => state.cart.couponLoading;

export default cartSlice.reducer;
