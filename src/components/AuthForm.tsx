"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { AtlasLogo, CheckIcon, ArrowLeftIcon, ArrowRightIcon } from "./icons";
import styles from "./AuthForm.module.css";

type AuthFormProps = {
  title: string;
  description: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  submitLabel: string;
  loading?: boolean;
  error?: string;
  footer?: ReactNode;
};

export function AuthForm({
  title,
  description,
  onSubmit,
  children,
  submitLabel,
  loading = false,
  error,
  footer,
}: AuthFormProps) {
  return (
    <div className={styles.card}>
      <div className={styles.brandHeader}>
        <Link href="/" className={styles.logoLink} aria-label="Atlas Home">
          <AtlasLogo height={32} />
        </Link>
      </div>

      <div className={styles.heading}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <form onSubmit={onSubmit} className={styles.form}>
        {children}

        {error && (
          <div className={styles.error} role="alert">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={styles.errorIcon}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? "Please wait..." : submitLabel}
        </button>
      </form>

      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {isPassword ? (
        <div className={styles.passwordWrap}>
          <input
            name={name}
            type={visible ? "text" : "password"}
            placeholder={placeholder}
            required
            autoComplete={autoComplete}
            className={styles.input}
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </button>
        </div>
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
          className={styles.input}
        />
      )}
    </label>
  );
}

export function BackToLogin() {
  return (
    <p>
      <Link href="/login" className={styles.backLink}>
        <ArrowLeftIcon size={14} className={styles.backArrow} />
        <span>Back to Sign In</span>
      </Link>
    </p>
  );
}

export function AuthSuccessCard({
  title = "Password updated",
  description = "Your password has been successfully updated.",
  actionText = "Back to Sign In",
  actionHref = "/login",
}: {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.brandHeader}>
        <Link href="/" className={styles.logoLink} aria-label="Atlas Home">
          <AtlasLogo height={32} />
        </Link>
      </div>

      <div className={styles.successIconWrapper}>
        <div className={styles.successIconInner}>
          <CheckIcon size={24} />
        </div>
      </div>

      <div className={styles.heading} style={{ textAlign: "center" }}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <Link href={actionHref} className={styles.submitLink}>
        {actionText}
      </Link>
    </div>
  );
}