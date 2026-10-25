"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Result, Spin } from "antd";
import { useAuth } from "hooks/useAuth";

import styles from "./ProtectedRoute.module.css";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: Array<"admin" | "superadmin">;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const hasRole =
    !allowedRoles || (user?.role ? allowedRoles.includes(user.role as "admin" | "superadmin") : false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated)
    return (
      <main className={styles.pageLoading}>
        <div className={styles.spinnerWrapper}>
          <Spin size="large" />
          <span className={styles.loadingText}>Loading...</span>
        </div>
      </main>
    );

  if (!hasRole)
    return (
      <main className={styles.pageLoading}>
        <Result
          status="403"
          title="Access denied"
          subTitle="This area is available to administrators only."
        />
      </main>
    );

  return children;
}