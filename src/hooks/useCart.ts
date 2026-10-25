"use client";

/**
 * useCart — Redux-backed replacement for the old CartContext useCart hook.
 *
 * This hook exposes the same API surface as the old context hook so that
 * existing page components work without modification.
 */

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "hooks/useAppStore";
import {
  addItem as addItemAction,
  updateQty as updateQtyAction,
  removeItem as removeItemAction,
  clearCart as clearCartAction,
  removeCoupon,
  applyCouponThunk,
  evaluateOffersThunk,
  fetchCartThunk,
  selectCartItems,
  selectCartHydrated,
  selectCartLoading,
  selectCartError,
  selectTotalItems,
  selectTotalPrice,
  selectCouponCode,
  selectCouponResult,
  selectCouponLoading,
  selectIsAuthenticated,
  openAuthModal,
} from "store";
import type { CartItem } from "store/slices/cartSlice";
import type { CouponValidationResult } from "utility/services/offers";

type AddItemInput = Omit<CartItem, "qty" | "key"> & { key?: string };

export function useCart() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectTotalItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  const couponCode = useAppSelector(selectCouponCode);
  const couponResult = useAppSelector(selectCouponResult);
  const couponLoading = useAppSelector(selectCouponLoading);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const cartLoading = useAppSelector(selectCartLoading);
  const cartError = useAppSelector(selectCartError);
  const cartHydrated = useAppSelector(selectCartHydrated);

  const loadCart = useCallback(() => {
    if (isAuthenticated) {
      dispatch(fetchCartThunk());
    }
  }, [dispatch, isAuthenticated]);

  const addItem = useCallback(
    (item: AddItemInput, qty = 1) => {
      if (!isAuthenticated) {
        dispatch(
          openAuthModal({
            tab: "login",
            message: "Please sign in or create an account to add items to your basket.",
            pendingAction: { type: "addToCart", payload: { item, qty } },
          })
        );
        return;
      }
      dispatch(addItemAction({ item, qty, isAuthenticated }));
    },
    [dispatch, isAuthenticated]
  );

  const updateQty = useCallback(
    (key: string, qty: number) => {
      if (!isAuthenticated) {
        dispatch(
          openAuthModal({
            tab: "login",
            message: "Please sign in to update your basket.",
          })
        );
        return;
      }
      dispatch(updateQtyAction({ key, qty, isAuthenticated }));
    },
    [dispatch, isAuthenticated]
  );

  const removeItem = useCallback(
    (key: string) => {
      dispatch(removeItemAction({ key, isAuthenticated }));
    },
    [dispatch, isAuthenticated]
  );

  const clear = useCallback(() => {
    dispatch(clearCartAction({ isAuthenticated }));
  }, [dispatch, isAuthenticated]);

  const applyCoupon = useCallback(
    async (code: string): Promise<CouponValidationResult> => {
      const result = await dispatch(applyCouponThunk({ code, items })).unwrap();
      return result.result;
    },
    [dispatch, items]
  );

  const removeAppliedCoupon = useCallback(() => {
    dispatch(removeCoupon());
  }, [dispatch]);

  const evaluateOffers = useCallback(async () => {
    if (isAuthenticated && items.length > 0) {
      await dispatch(evaluateOffersThunk());
    }
  }, [dispatch, isAuthenticated, items.length]);

  return {
    items,
    totalItems,
    totalPrice,
    loading: cartLoading,
    hydrated: cartHydrated,
    error: cartError,
    loadCart,
    addItem,
    updateQty,
    removeItem,
    clear,
    couponCode,
    couponResult,
    couponLoading,
    applyCoupon,
    removeCoupon: removeAppliedCoupon,
    evaluateOffers,
  };
}
