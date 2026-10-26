"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { AuthForm, Field } from "components";
import { AuthShell } from "components";
import { ArrowRightIcon } from "components/icons";
import { useAppDispatch, useAppSelector } from "hooks/useAppStore";
import {
  loginThunk,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthHydrating,
  selectPendingVerificationEmail,
  clearAuthError,
  fetchWishlistThunk,
} from "store";
import type { User } from "utility/services/auth";

function destinationFor(role?: User["role"]) {
  return role === "admin" || role === "superadmin" ? "/admin/dashboard" : "/";
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector(selectAuthLoading);
  const hydrating = useAppSelector(selectAuthHydrating);
  const error = useAppSelector(selectAuthError);
  const pendingVerificationEmail = useAppSelector(selectPendingVerificationEmail);

  // Ref to track whether a login attempt was made in this session
  const didAttemptLogin = useRef(false);

  useEffect(() => {
    if (!hydrating && isAuthenticated) router.replace(destinationFor(user?.role));
  }, [hydrating, isAuthenticated, user, router]);

  // Clear any previous error when page mounts
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Only auto-redirect to verify-email if login was actually attempted in this session
  // and the backend rejected with emailVerified:false — NOT on page load from persisted state
  useEffect(() => {
    if (didAttemptLogin.current && pendingVerificationEmail && !isAuthenticated) {
      router.push(`/verify-email?email=${encodeURIComponent(pendingVerificationEmail)}`);
    }
  }, [pendingVerificationEmail, isAuthenticated, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).toLowerCase();
    const password = String(data.get("password"));
    didAttemptLogin.current = true;
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      didAttemptLogin.current = false;
      dispatch(fetchWishlistThunk());
      router.push(destinationFor(result.payload.user.role));
    }
    // If rejected with emailVerified: false, the useEffect above handles redirect
  }

  return (
    <AuthShell>
      <AuthForm
        title="Welcome back"
        description="Sign in to continue shopping with LUXE JWELS."
        onSubmit={handleSubmit}
        submitLabel="Sign In"
        loading={loading}
        error={error || undefined}
        footer={
          <>
            <p>
              <Link href="/forgot-password">Forgot password?</Link>
            </p>
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/register">
                <span>Create an account</span>
                <ArrowRightIcon size={14} />
              </Link>
            </p>
          </>
        }
      >
        <Field
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </AuthForm>
    </AuthShell>
  );
}