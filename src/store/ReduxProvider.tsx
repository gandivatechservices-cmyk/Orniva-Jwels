"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "store/store";
import {
  hydrateFromStorage,
  hydrateCart,
  fetchWishlistThunk,
  selectIsAuthenticated,
} from "store";

/**
 * AppHydrator runs once after mount to:
 * 1. Read tokens + user from localStorage into Redux auth state
 * 2. Hydrate cart from localStorage into Redux cart state without eager network fetching
 * 3. Load the wishlist once for a signed-in user, so the header count is right on first paint
 */
function AppHydrator() {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    // Hydrate auth from storage
    store.dispatch(hydrateFromStorage());

    // Hydrate cart items synchronously from localStorage (zero network calls)
    store.dispatch(hydrateCart());

    // Signed in (restored from storage): fetch the wishlist now, not only when the wishlist page is opened
    if (selectIsAuthenticated(store.getState())) {
      store.dispatch(fetchWishlistThunk());
    }
  }, []);

  return null;
}

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AppHydrator />
      {children}
    </Provider>
  );
}
