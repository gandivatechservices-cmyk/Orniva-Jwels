import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { wishlistService } from "utility/services/wishlist";
import type { Product } from "utility/services/catalog";
import type { RootState } from "../store";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------
interface WishlistState {
  productIds: string[];
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: WishlistState = {
  productIds: [],
  items: [],
  status: "idle",
  error: null,
};

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------
export const fetchWishlistThunk = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const wishlist = await wishlistService.getWishlist();
      const items = wishlist?.items ?? [];
      const productIds = items.map((p) => p._id);
      return { items, productIds };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load wishlist.");
    }
  }
);

export const toggleWishlistThunk = createAsyncThunk(
  "wishlist/toggle",
  async (
    { productId, product, wasWishlisted }: { productId: string; product?: Product; wasWishlisted: boolean },
    { rejectWithValue }
  ) => {
    try {
      if (wasWishlisted) {
        await wishlistService.removeItem(productId);
      } else {
        await wishlistService.addItem(productId);
      }
      return { productId, product, wasWishlisted };
    } catch (err: unknown) {
      return rejectWithValue({ productId, wasWishlisted, message: err instanceof Error ? err.message : "Wishlist update failed." });
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist(state) {
      state.productIds = [];
      state.items = [];
      state.status = "idle";
    },
    /** Optimistic toggle — applied immediately before the thunk resolves */
    optimisticToggle(
      state,
      action: { payload: { productId: string; product?: Product; wasWishlisted: boolean } }
    ) {
      const { productId, product, wasWishlisted } = action.payload;
      if (wasWishlisted) {
        state.productIds = state.productIds.filter((id) => id !== productId);
        state.items = state.items.filter((item) => item._id !== productId);
      } else {
        if (!state.productIds.includes(productId)) {
          state.productIds.push(productId);
        }
        if (product && !state.items.some((item) => item._id === productId)) {
          state.items.push(product);
        }
      }
    },
    /** Revert optimistic update on failure */
    revertToggle(
      state,
      action: { payload: { productId: string; product?: Product; wasWishlisted: boolean } }
    ) {
      const { productId, product, wasWishlisted } = action.payload;
      if (wasWishlisted) {
        if (!state.productIds.includes(productId)) {
          state.productIds.push(productId);
        }
        if (product && !state.items.some((item) => item._id === productId)) {
          state.items.push(product);
        }
      } else {
        state.productIds = state.productIds.filter((id) => id !== productId);
        state.items = state.items.filter((item) => item._id !== productId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWishlistThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.items;
        state.productIds = action.payload.productIds;
      })
      .addCase(fetchWishlistThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    builder
      .addCase(toggleWishlistThunk.rejected, (state, action) => {
        const { productId, wasWishlisted } = action.payload as {
          productId: string;
          wasWishlisted: boolean;
          message: string;
        };
        if (wasWishlisted) {
          if (!state.productIds.includes(productId)) state.productIds.push(productId);
        } else {
          state.productIds = state.productIds.filter((id) => id !== productId);
          state.items = state.items.filter((item) => item._id !== productId);
        }
      });
  },
});

export const { clearWishlist, optimisticToggle, revertToggle } = wishlistSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectWishlistIds = (state: RootState) => state.wishlist.productIds;
export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistLoading = (state: RootState) => state.wishlist.status === "loading";
export const selectWishlistError = (state: RootState) => state.wishlist.error;
export const selectIsWishlisted = (productId: string) => (state: RootState) =>
  state.wishlist.productIds.includes(productId);

export default wishlistSlice.reducer;
