"use client";

/**
 * useWishlist — Redux-backed replacement for the old WishlistContext useWishlist hook.
 *
 * Optimistic UI: the local state is updated immediately, then the API call is
 * made. If the API call fails, the state is reverted automatically by the slice.
 */

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "hooks/useAppStore";
import {
  selectWishlistIds,
  selectWishlistItems,
  selectWishlistLoading,
  selectWishlistError,
  selectIsAuthenticated,
  optimisticToggle,
  toggleWishlistThunk,
  fetchWishlistThunk,
  openAuthModal,
} from "store";
import type { Product } from "utility/services/catalog";

export function useWishlist() {
  const dispatch = useAppDispatch();
  const productIds = useAppSelector(selectWishlistIds);
  const items = useAppSelector(selectWishlistItems);
  const loading = useAppSelector(selectWishlistLoading);
  const error = useAppSelector(selectWishlistError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isWishlisted = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds]
  );

  const loadWishlist = useCallback(() => {
    return dispatch(fetchWishlistThunk());
  }, [dispatch]);

  const toggle = useCallback(
    async (productId: string, product?: Product): Promise<void> => {
      if (!isAuthenticated) {
        dispatch(
          openAuthModal({
            tab: "login",
            message: "Please sign in or create an account to save items to your wishlist.",
            pendingAction: { type: "wishlist", payload: { productId } },
          })
        );
        return;
      }
      const wasWishlisted = productIds.includes(productId);
      // Optimistic update
      dispatch(optimisticToggle({ productId, product, wasWishlisted }));
      // Fire API call — the slice reverts on failure
      await dispatch(toggleWishlistThunk({ productId, product, wasWishlisted }));
    },
    [dispatch, productIds, isAuthenticated]
  );

  return { productIds, items, loading, error, isWishlisted, toggle, loadWishlist };
}
