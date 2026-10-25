"use client";

import { Suspense, type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForm, AuthSuccessCard, BackToLogin, Field, AuthShell } from "components";
import { authService } from "utility/services";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");

    if (!password) {
      setError("Please enter a new password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/\d/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (!/[\W_]/.test(password)) {
      setError("Password must contain at least one special character (e.g. !@#$%^&*).");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Missing reset token. Please request a new reset code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await authService.resetPassword(email, token, password);
      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to reset password.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <AuthShell>
        <AuthSuccessCard
          title="Password updated"
          description="Your password has been successfully updated. You can now sign in to your account with your new password."
          actionText="Back to Sign In"
          actionHref="/login"
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthForm
        title="Create a new password"
        description="Choose a new password for your account."
        onSubmit={handleSubmit}
        submitLabel="Reset Password"
        loading={loading}
        error={error}
        footer={<BackToLogin />}
      >
        <Field
          label="New password"
          name="password"
          type="password"
          placeholder="Enter new password (min. 6 characters)"
          autoComplete="new-password"
        />
        <Field
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          autoComplete="new-password"
        />
      </AuthForm>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}