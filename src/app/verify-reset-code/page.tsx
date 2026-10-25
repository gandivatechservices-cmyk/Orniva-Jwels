"use client";

import { Suspense, type FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthForm, BackToLogin, Field, AuthShell } from "components";
import { authService } from "utility/services";

function VerifyResetCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") || "").trim();
    if (!code) {
      setError("Please enter the verification code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await authService.verifyResetCode(email, code);
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(result.resetToken)}`,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Invalid or expired verification code.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <AuthForm
        title="Check your email"
        description={
          email
            ? `Enter the 6-digit verification code sent to ${email}.`
            : "Enter the 6-digit verification code sent to your email."
        }
        onSubmit={handleSubmit}
        submitLabel="Verify Code"
        loading={loading}
        error={error}
        footer={<BackToLogin />}
      >
        <Field
          label="Verification code"
          name="code"
          placeholder="Enter 6-digit code"
          autoComplete="one-time-code"
        />
      </AuthForm>
    </AuthShell>
  );
}

export default function VerifyResetCodePage() {
  return (
    <Suspense fallback={null}>
      <VerifyResetCodeContent />
    </Suspense>
  );
}