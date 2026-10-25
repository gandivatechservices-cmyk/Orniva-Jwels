"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useCart } from "./useCart";
import type { CartItem } from "../store/slices/cartSlice";
import type { Product } from "../utility/services/catalog";
import { getGroceryProductImage } from "../constants/images";
import { IMAGES } from "../constants/images";

// ---------------------------------------------------------------------------
// 1. Single Product Cart Hook (Used in Product Details Page, Modals, etc.)
// ---------------------------------------------------------------------------
export interface UseProductCartOptions {
  product?: Product | null;
  productId?: string;
  variantId?: string;
  name?: string;
  price?: number;
  stock?: number;
  domainId?: string;
  currency?: string;
  image?: string;
  initialQty?: number;
}

export function useProductCart(options: UseProductCartOptions) {
  const { addItem, updateQty, removeItem, items: cartItems } = useCart();
  const [localQty, setLocalQty] = useState(options.initialQty || 1);

  const resolvedProductId = options.productId || options.product?._id || "";
  const resolvedVariantId =
    options.variantId || options.product?.variants?.[0]?._id;
  const resolvedStock =
    typeof options.stock === "number"
      ? options.stock
      : options.product?.variants?.[0]?.stock ?? 10;
  const resolvedPrice =
    typeof options.price === "number"
      ? options.price
      : options.product?.basePrice ?? 0;
  const resolvedCurrency = options.currency || "GBP";
  const resolvedImage =
    options.image ||
    (options.product ? getGroceryProductImage(options.product) : IMAGES.placeholders.product);
  const resolvedName = options.name || options.product?.name || "Product";
  const resolvedDomainId = options.domainId || options.product?.domainId || "";

  // Reset localQty when variant or product changes
  useEffect(() => {
    setLocalQty(1);
  }, [resolvedProductId, resolvedVariantId]);

  // Find matching cart item for this product/variant
  const cartItem = useMemo(() => {
    if (!resolvedProductId) return undefined;
    return (
      cartItems.find((ci) => {
        if (ci.productId !== resolvedProductId) return false;
        if (resolvedVariantId && ci.variantId) {
          return ci.variantId === resolvedVariantId;
        }
        return true;
      }) ||
      cartItems.find((ci) => ci.productId === resolvedProductId)
    );
  }, [cartItems, resolvedProductId, resolvedVariantId]);

  const cartQty = cartItem?.qty || 0;
  const isInCart = cartQty > 0;
  const displayQty = isInCart ? cartQty : localQty;

  const increment = useCallback(() => {
    if (!resolvedProductId || resolvedStock <= 0) return;
    if (cartItem) {
      const nextQty = Math.min(resolvedStock, cartItem.qty + 1);
      if (nextQty !== cartItem.qty) {
        updateQty(cartItem.key, nextQty);
      }
    } else {
      addItem(
        {
          productId: resolvedProductId,
          variantId: resolvedVariantId,
          name: resolvedName,
          price: resolvedPrice,
          domainId: resolvedDomainId,
          currency: resolvedCurrency,
          image: resolvedImage,
          stock: resolvedStock,
        },
        1
      );
    }
  }, [
    resolvedProductId,
    resolvedStock,
    cartItem,
    updateQty,
    addItem,
    resolvedVariantId,
    resolvedName,
    resolvedPrice,
    resolvedDomainId,
    resolvedCurrency,
    resolvedImage,
  ]);

  const decrement = useCallback(() => {
    if (!resolvedProductId) return;
    if (cartItem) {
      if (cartItem.qty > 1) {
        updateQty(cartItem.key, cartItem.qty - 1);
      } else {
        updateQty(cartItem.key, 0);
      }
    } else {
      setLocalQty((prev) => Math.max(1, prev - 1));
    }
  }, [resolvedProductId, cartItem, updateQty]);

  const setQuantity = useCallback(
    (newQty: number) => {
      if (!resolvedProductId) return;
      const clamped = Math.max(0, Math.min(resolvedStock, newQty));
      if (cartItem) {
        updateQty(cartItem.key, clamped);
      } else {
        setLocalQty(Math.max(1, clamped));
      }
    },
    [resolvedProductId, resolvedStock, cartItem, updateQty]
  );

  const addToCart = useCallback(
    (qtyToAdd?: number) => {
      if (!resolvedProductId || resolvedStock <= 0) return;
      if (cartItem) {
        const delta = typeof qtyToAdd === "number" ? qtyToAdd : 1;
        const nextQty = Math.min(resolvedStock, cartItem.qty + delta);
        updateQty(cartItem.key, nextQty);
      } else {
        const qty = typeof qtyToAdd === "number" ? qtyToAdd : localQty;
        addItem(
          {
            productId: resolvedProductId,
            variantId: resolvedVariantId,
            name: resolvedName,
            price: resolvedPrice,
            domainId: resolvedDomainId,
            currency: resolvedCurrency,
            image: resolvedImage,
            stock: resolvedStock,
          },
          qty || 1
        );
      }
    },
    [
      resolvedProductId,
      resolvedStock,
      cartItem,
      localQty,
      updateQty,
      addItem,
      resolvedVariantId,
      resolvedName,
      resolvedPrice,
      resolvedDomainId,
      resolvedCurrency,
      resolvedImage,
    ]
  );

  return {
    cartItem,
    cartQty,
    isInCart,
    localQty,
    displayQty,
    setLocalQty,
    increment,
    decrement,
    setQuantity,
    addToCart,
    handleIncrement: increment,
    handleDecrement: decrement,
    handleAddToCart: addToCart,
  };
}

// ---------------------------------------------------------------------------
// 2. Multi-Product List Cart Hook (Used in Home, Catalog, Wishlist, Category)
// ---------------------------------------------------------------------------
export interface UseCartQuantityOptions {
  products?: Product[];
  domainCurrencyMap?: Record<string, string>;
  defaultCurrency?: string;
}

export function useCartQuantity(options: UseCartQuantityOptions = {}) {
  const { addItem, updateQty, removeItem, items: cartItems } = useCart();
  const { products = [], domainCurrencyMap = {}, defaultCurrency = "GBP" } = options;

  const getItem = useCallback(
    (productId: string, variantId?: string): CartItem | undefined => {
      return (
        cartItems.find((ci) => {
          if (ci.productId !== productId) return false;
          if (variantId && ci.variantId) {
            return ci.variantId === variantId;
          }
          return true;
        }) ||
        cartItems.find((ci) => ci.productId === productId)
      );
    },
    [cartItems]
  );

  const getQty = useCallback(
    (productId: string, variantId?: string): number => {
      const item = getItem(productId, variantId);
      return item ? item.qty : 0;
    },
    [getItem]
  );

  const handleAddToCart = useCallback(
    (productId: string, qty = 1, productFallback?: Product) => {
      const product =
        products.find((p) => p._id === productId) || productFallback;
      if (!product) return;

      const currency =
        (product.domainId && domainCurrencyMap[product.domainId]) ||
        defaultCurrency;

      addItem(
        {
          productId: product._id,
          variantId: product.variants?.[0]?._id,
          name: product.name,
          price: product.basePrice,
          domainId: product.domainId || "",
          currency,
          image: getGroceryProductImage(product),
          stock: product.variants?.[0]?.stock ?? 10,
        },
        qty
      );
    },
    [products, domainCurrencyMap, defaultCurrency, addItem]
  );

  const handleUpdateQty = useCallback(
    (productId: string, newQty: number, productFallback?: Product) => {
      const cartItem = getItem(productId);
      if (cartItem) {
        updateQty(cartItem.key, newQty);
      } else if (newQty > 0) {
        handleAddToCart(productId, newQty, productFallback);
      }
    },
    [getItem, updateQty, handleAddToCart]
  );

  const handleIncrement = useCallback(
    (productId: string, productFallback?: Product) => {
      const cartItem = getItem(productId);
      if (cartItem) {
        const stock = cartItem.stock ?? 99;
        const nextQty = Math.min(stock, cartItem.qty + 1);
        if (nextQty !== cartItem.qty) {
          updateQty(cartItem.key, nextQty);
        }
      } else {
        handleAddToCart(productId, 1, productFallback);
      }
    },
    [getItem, updateQty, handleAddToCart]
  );

  const handleDecrement = useCallback(
    (productId: string) => {
      const cartItem = getItem(productId);
      if (cartItem) {
        if (cartItem.qty > 1) {
          updateQty(cartItem.key, cartItem.qty - 1);
        } else {
          updateQty(cartItem.key, 0);
        }
      }
    },
    [getItem, updateQty]
  );

  return {
    items: cartItems,
    getItem,
    getQty,
    handleAddToCart,
    handleUpdateQty,
    handleIncrement,
    handleDecrement,
  };
}
