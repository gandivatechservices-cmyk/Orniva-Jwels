"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "components";
import { AtlasLogo } from "components/icons";
import { useAppDispatch, useAppSelector } from "hooks/useAppStore";
import {
  verifyEmailThunk,
  resendEmailOtpThunk,
  selectAuthLoading,
  selectAuthError,
  selectPendingVerificationEmail,
  selectIsAuthenticated,
  selectAuthHydrating,
  clearAuthError,
  setPendingVerificationEmail,
} from "store";
import { AuthSuccessCard } from "components/AuthForm";
import styles from "./verify-email.module.css";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

/** Minimal skeleton shown while the Suspense boundary resolves */
function VerifyEmailSkeleton() {
  return (
    <div className={styles.card} style={{ minHeight: 420 }}>
      <div style={{ height: 32, width: 80, background: "#F3EFE9", borderRadius: 6, marginBottom: 20 }} />
      <div style={{ height: 60, width: 60, borderRadius: "50%", background: "#FAF5EE", margin: "0 auto 20px" }} />
      <div style={{ height: 24, background: "#F3EFE9", borderRadius: 6, marginBottom: 12 }} />
      <div style={{ height: 16, background: "#F3EFE9", borderRadius: 6, width: "80%", margin: "0 auto" }} />
    </div>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const hydrating = useAppSelector(selectAuthHydrating);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const pendingEmail = useAppSelector(selectPendingVerificationEmail);

  // Derive email: prefer query param, fall back to Redux/localStorage state
  const emailFromQuery = searchParams.get("email") ?? "";
  const email = emailFromQuery || pendingEmail || "";

  // OTP digit state — array of 6 strings
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resend success message
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Whether OTP verification succeeded
  const [verified, setVerified] = useState(false);

  // If already authenticated (fully logged in), go home
  useEffect(() => {
    if (!hydrating && isAuthenticated) router.replace("/");
  }, [hydrating, isAuthenticated, router]);

  // Clear error on mount
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // If no email at all (user navigated here directly without context), redirect
  useEffect(() => {
    if (!hydrating && !email) {
      router.replace("/register");
    }
  }, [hydrating, email, router]);

  // Cleanup interval on unmount
  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  // Start resend cooldown countdown
  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  // -------------------------------------------------------------------------
  // OTP input handlers
  // -------------------------------------------------------------------------
  function handleDigitChange(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    dispatch(clearAuthError());
    setResendMessage(null);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  // -------------------------------------------------------------------------
  // Submit verification
  // -------------------------------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) return;

    const result = await dispatch(verifyEmailThunk({ email, otp }));
    if (verifyEmailThunk.fulfilled.match(result)) {
      setVerified(true);
    }
  }

  // -------------------------------------------------------------------------
  // Resend OTP
  // -------------------------------------------------------------------------
  async function handleResend() {
    if (cooldown > 0 || !email) return;
    setResendMessage(null);
    dispatch(clearAuthError());
    const result = await dispatch(resendEmailOtpThunk({ email }));
    if (resendEmailOtpThunk.fulfilled.match(result)) {
      setResendMessage("A new verification code has been sent to your email.");
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      startCooldown();
    }
  }

  // Clear pending email and navigate to login — breaks the redirect loop
  function handleBackToLogin(e: React.MouseEvent) {
    e.preventDefault();
    dispatch(setPendingVerificationEmail(null));
    router.push("/login");
  }

  const otp = digits.join("");
  const canSubmit = otp.length === OTP_LENGTH && !loading;

  // -------------------------------------------------------------------------
  // Success state — show confirmation card
  // -------------------------------------------------------------------------
  if (verified) {
    return (
      <AuthSuccessCard
        title="Email verified!"
        description="Your email has been verified successfully. You can now sign in to your account."
        actionText="Sign In"
        actionHref="/login"
      />
    );
  }

  // Mask email for display: jo**@example.com
  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.max(1, b.length)) + c)
    : "";

  return (
    <div className={styles.card}>
      {/* Brand header */}
      <div className={styles.brandHeader}>
        <Link href="/" className={styles.logoLink} aria-label="LUXE JWELS Home">
          <AtlasLogo height={30} />
        </Link>
      </div>

      {/* Email icon */}
      <div className={styles.iconWrapper} aria-hidden="true">
        <div className={styles.iconInner}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polyline points="2,4 12,13 22,4" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <div className={styles.heading}>
        <h2>Check your email</h2>
        <p>
          We sent a 6-digit verification code to{" "}
          <strong>{maskedEmail || "your email address"}</strong>.
          <br />
          Enter it below to complete your registration.
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <fieldset className={styles.otpFieldset} disabled={loading}>
          <legend className={styles.otpLabel}>Verification code</legend>
          <div className={styles.otpInputs} onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onFocus={(e) => e.target.select()}
                className={`${styles.otpInput} ${error ? styles.otpInputError : ""}`}
                aria-label={`Digit ${idx + 1} of ${OTP_LENGTH}`}
                autoComplete={idx === 0 ? "one-time-code" : "off"}
                id={`otp-digit-${idx}`}
              />
            ))}
          </div>
        </fieldset>

        {/* Error */}
        {error && (
          <div className={styles.error} role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Resend success */}
        {resendMessage && !error && (
          <div className={styles.success} role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span>{resendMessage}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className={styles.submit}
          disabled={!canSubmit}
          aria-busy={loading}
        >
          {loading ? (
            <span className={styles.spinner} aria-label="Verifying…" />
          ) : (
            "Verify Email"
          )}
        </button>
      </form>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Didn&apos;t receive the code?</p>
        {cooldown > 0 ? (
          <p className={styles.cooldownText}>
            Resend available in <strong>{cooldown}s</strong>
          </p>
        ) : (
          <button
            type="button"
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={loading}
          >
            Resend verification code
          </button>
        )}
        <p className={styles.backLink}>
          <a href="/login" onClick={handleBackToLogin} style={{ cursor: "pointer" }}>← Back to Sign In</a>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <Suspense fallback={<VerifyEmailSkeleton />}>
        <VerifyEmailContent />
      </Suspense>
    </AuthShell>
  );
}
