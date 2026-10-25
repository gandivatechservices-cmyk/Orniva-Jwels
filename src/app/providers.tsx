"use client";

import type { ReactNode } from "react";
import { App as AntApp, ConfigProvider } from "antd";
import { ReduxProvider } from "store/ReduxProvider";
import { shopperTheme } from "theme";

/**
 * Application providers hierarchy:
 * 1. Redux store   — global state (auth, cart, wishlist)
 * 2. Ant Design    — theming / App context for antd message/modal/notification
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <ConfigProvider theme={shopperTheme}>
        <AntApp>{children}</AntApp>
      </ConfigProvider>
    </ReduxProvider>
  );
}