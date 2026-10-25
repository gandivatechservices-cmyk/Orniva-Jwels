"use client";

/**
 * useAuth — Redux-backed replacement for the old AuthContext useAuth hook.
 *
 * This hook presents the same API surface as the old context version so that
 * all existing page components work without modification. Internally it reads
 * from the Redux auth slice and dispatches the appropriate thunks.
 */

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "hooks/useAppStore";
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthHydrating,
  loginSuccess,
  logout as logoutAction,
  clearAuthError,
  fetchWishlistThunk,
  clearWishlist,
  updateProfileThunk,
  getMeThunk,
  openAuthModal,
  closeAuthModal,
  clearPendingAction,
  selectIsAuthModalOpen,
  selectAuthModalTab,
  selectAuthModalMessage,
  selectPendingAction,
} from "store";
import type { User, UpdateProfilePayload } from "utility/services/auth";

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const hydrating = useAppSelector(selectAuthHydrating);
  const error = useAppSelector(selectAuthError);
  const isAuthModalOpen = useAppSelector(selectIsAuthModalOpen);
  const authModalTab = useAppSelector(selectAuthModalTab);
  const authModalMessage = useAppSelector(selectAuthModalMessage);
  const pendingAction = useAppSelector(selectPendingAction);

  const showAuthModal = useCallback(
    (options?: { tab?: "login" | "register"; message?: string; pendingAction?: any }) => {
      dispatch(openAuthModal(options));
    },
    [dispatch]
  );

  const hideAuthModal = useCallback(() => {
    dispatch(closeAuthModal());
  }, [dispatch]);

  const clearPending = useCallback(() => {
    dispatch(clearPendingAction());
  }, [dispatch]);

  const login = useCallback(
    (data: { accessToken: string; refreshToken?: string; user: User }) => {
      dispatch(loginSuccess(data));
      // Fetch wishlist immediately after login
      dispatch(fetchWishlistThunk());
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
    dispatch(clearWishlist());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const updateProfile = useCallback(
    (data: UpdateProfilePayload) => dispatch(updateProfileThunk(data)),
    [dispatch]
  );

  const refreshUser = useCallback(() => {
    return dispatch(getMeThunk());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    /** true while we are still hydrating from localStorage OR an auth request is in-flight */
    loading: loading || hydrating,
    error,
    login,
    logout,
    clearError,
    updateProfile,
    refreshUser,
    isAuthModalOpen,
    authModalTab,
    authModalMessage,
    pendingAction,
    showAuthModal,
    hideAuthModal,
    clearPending,
  };
}
