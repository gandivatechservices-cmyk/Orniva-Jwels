"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthForm, Field } from "components";
import { AuthShell } from "components";
import { ArrowRightIcon } from "components/icons";
import { useAppDispatch, useAppSelector } from "hooks/useAppStore";
import {
  registerThunk,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectAuthHydrating,
  clearAuthError,
} from "store";
import type { User } from "utility/services/auth";

function destinationFor(role?: User["role"]) {
  return role === "admin" || role === "superadmin" ? "/admin/dashboard" : "/";
}

/** Validates strong password requirements */
function checkStrongPassword(password: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[\W_]/.test(password)) {
    return "Password must contain at least one special character (e.g. !@#$%^&*).";
  }
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector(selectAuthLoading);
  const hydrating = useAppSelector(selectAuthHydrating);
  const error = useAppSelector(selectAuthError);
  const [localError, setLocalError] = useState("");

  // If already authenticated, skip to home/dashboard
  useEffect(() => {
    if (!hydrating && isAuthenticated) router.replace(destinationFor(user?.role));
  }, [hydrating, isAuthenticated, user, router]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");
    dispatch(clearAuthError());

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").toLowerCase().trim();
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");

    if (!name) {
      setLocalError("Please enter your full name.");
      return;
    }

    if (!email) {
      setLocalError("Please enter your email address.");
      return;
    }

    const passwordError = checkStrongPassword(password);
    if (passwordError) {
      setLocalError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    const result = await dispatch(registerThunk({ name, email, password }));
    if (registerThunk.fulfilled.match(result)) {
      // Registration successful — redirect to OTP verification screen
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  }

  const displayedError = localError || error || undefined;

  return (
    <AuthShell>
      <AuthForm
        title="Create your account"
        description="Join LUXE JWELS to save favourites and track your orders."
        onSubmit={handleSubmit}
        submitLabel="Create Account"
        loading={loading}
        error={displayedError}
        footer={
          <p>
            Already have an account?{" "}
            <Link href="/login">
              <span>Sign In</span>
              <ArrowRightIcon size={14} />
            </Link>
          </p>
        }
      >
        <Field
          label="Full name"
          name="name"
          placeholder="Jane Doe"
          autoComplete="name"
        />
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
          placeholder="Min. 8 characters with Aa, 1, @"
          autoComplete="new-password"
        />
        <Field
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />
      </AuthForm>
    </AuthShell>
  );
}
