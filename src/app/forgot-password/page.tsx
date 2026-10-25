"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthForm, BackToLogin, Field } from "components";
import { AuthShell } from "components";
import { authService } from "utility/services";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") || "").toLowerCase().trim();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true); setError("");
    try {
      await authService.forgotPassword(email);
      router.push(`/verify-reset-code?email=${encodeURIComponent(email)}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send reset instructions.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthForm
        title="Forgot your password?"
        description="Enter your email address and we'll send you a verification code to reset your password."
        onSubmit={handleSubmit}
        submitLabel="Send Reset Code"
        loading={loading}
        error={error}
        footer={<BackToLogin />}
      >
        <Field
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </AuthForm>
    </AuthShell>
  );
}