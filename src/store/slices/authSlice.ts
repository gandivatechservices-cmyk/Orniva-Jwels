import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { authService, type User } from "utility/services/auth";
import type { RootState } from "../store";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  /** true while we are still reading the stored tokens from localStorage */
  hydrating: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  authModalMessage: string | null;
  pendingAction: { type: "addToCart" | "wishlist"; payload: any } | null;
  /** email pending OTP verification (set after register, cleared on verify success) */
  pendingVerificationEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  status: "idle",
  error: null,
  hydrating: true,
  isAuthModalOpen: false,
  authModalTab: "login",
  authModalMessage: null,
  pendingAction: null,
  pendingVerificationEmail: null,
};

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const tokens = await authService.login(payload);
      // Persist tokens immediately so subsequent calls within this thunk are authenticated
      window.localStorage.setItem("accessToken", tokens.accessToken);
      if (tokens.refreshToken) window.localStorage.setItem("refreshToken", tokens.refreshToken);
      const user = await authService.getMe();
      window.localStorage.setItem("user", JSON.stringify(user));
      return { ...tokens, user };
    } catch (err: unknown) {
      window.localStorage.removeItem("accessToken");
      // Check if this is an unverified user (403 from backend)
      if (err && typeof err === "object" && "status" in err && (err as any).status === 403) {
        const details = (err as any).details;
        const email = payload.email;
        return rejectWithValue({
          message: (details?.message as string) ?? "Please verify your email before logging in.",
          emailVerified: false,
          email,
        });
      }
      return rejectWithValue(err instanceof Error ? err.message : "Unable to sign in.");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const result = await authService.register(payload);
      // Backend now returns { message, emailVerified: false } — NOT tokens
      return { ...result, email: payload.email };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Unable to create your account.");
    }
  }
);

export const verifyEmailThunk = createAsyncThunk(
  "auth/verifyEmail",
  async (payload: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const result = await authService.verifyEmail(payload.email, payload.otp);
      return result;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Invalid or expired verification code.");
    }
  }
);

export const resendEmailOtpThunk = createAsyncThunk(
  "auth/resendEmailOtp",
  async (payload: { email: string }, { rejectWithValue }) => {
    try {
      const result = await authService.resendEmailOtp(payload.email);
      return result;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to resend verification code.");
    }
  }
);

export const refreshTokenThunk = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const storedRefresh = window.localStorage.getItem("refreshToken");
      if (!storedRefresh) throw new Error("No refresh token available.");
      const tokens = await authService.refresh(storedRefresh);
      window.localStorage.setItem("accessToken", tokens.accessToken);
      if (tokens.refreshToken) window.localStorage.setItem("refreshToken", tokens.refreshToken);
      const user = await authService.getMe();
      window.localStorage.setItem("user", JSON.stringify(user));
      return { ...tokens, user };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Session expired. Please sign in again.");
    }
  }
);

export const getMeThunk = createAsyncThunk(
  "auth/getMe",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getMe();
      window.localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to load user profile.");
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (payload: import("utility/services/auth").UpdateProfilePayload, { rejectWithValue }) => {
    try {
      const { usersService } = await import("utility/services/users");
      const user = await usersService.updateMe(payload);
      window.localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : "Failed to update profile.");
    }
  }
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Called once on app mount to hydrate tokens from localStorage */
    hydrateFromStorage(state) {
      if (typeof window === "undefined") {
        state.hydrating = false;
        return;
      }
      const token = window.localStorage.getItem("accessToken");
      const refresh = window.localStorage.getItem("refreshToken");
      const storedUser = window.localStorage.getItem("user");
      const pendingEmail = window.localStorage.getItem("pendingVerificationEmail");
      state.accessToken = token;
      state.refreshToken = refresh;
      state.user = storedUser ? (JSON.parse(storedUser) as User) : null;
      state.pendingVerificationEmail = pendingEmail;
      state.hydrating = false;
    },
    /** Manual login with pre-fetched tokens + user (used by legacy pages during transition) */
    loginSuccess(
      state,
      action: PayloadAction<{ accessToken: string; refreshToken?: string; user: User }>
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.status = "succeeded";
      state.error = null;
      window.localStorage.setItem("accessToken", action.payload.accessToken);
      if (action.payload.refreshToken) {
        window.localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
      window.localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.status = "idle";
      state.error = null;
      state.pendingVerificationEmail = null;
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      window.localStorage.removeItem("user");
      window.localStorage.removeItem("pendingVerificationEmail");
    },
    clearAuthError(state) {
      state.error = null;
    },
    openAuthModal(
      state,
      action: PayloadAction<{
        tab?: "login" | "register";
        message?: string;
        pendingAction?: { type: "addToCart" | "wishlist"; payload: any };
      } | undefined>
    ) {
      state.isAuthModalOpen = true;
      state.authModalTab = action?.payload?.tab ?? "login";
      state.authModalMessage = action?.payload?.message ?? null;
      if (action?.payload?.pendingAction) {
        state.pendingAction = action.payload.pendingAction;
      }
    },
    closeAuthModal(state) {
      state.isAuthModalOpen = false;
      state.authModalMessage = null;
      state.error = null;
    },
    clearPendingAction(state) {
      state.pendingAction = null;
    },
    /** Stores the email waiting for OTP verification (persisted to localStorage) */
    setPendingVerificationEmail(state, action: PayloadAction<string | null>) {
      state.pendingVerificationEmail = action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) {
          window.localStorage.setItem("pendingVerificationEmail", action.payload);
        } else {
          window.localStorage.removeItem("pendingVerificationEmail");
        }
      }
    },
  },
  extraReducers: (builder) => {
    // login
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken ?? null;
        state.isAuthModalOpen = false;
        state.authModalMessage = null;
        state.pendingVerificationEmail = null;
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("pendingVerificationEmail");
        }
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        // If the rejection payload is an object (unverified user), store the email
        if (action.payload && typeof action.payload === "object" && "emailVerified" in (action.payload as object)) {
          const p = action.payload as { message: string; emailVerified: boolean; email: string };
          state.error = p.message;
          state.pendingVerificationEmail = p.email;
          if (typeof window !== "undefined") {
            window.localStorage.setItem("pendingVerificationEmail", p.email);
          }
        } else {
          state.error = action.payload as string;
        }
      });

    // register
    builder
      .addCase(registerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        // NOT logging user in — they must verify email first
        state.pendingVerificationEmail = action.payload.email;
        if (typeof window !== "undefined") {
          window.localStorage.setItem("pendingVerificationEmail", action.payload.email);
        }
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // verifyEmail
    builder
      .addCase(verifyEmailThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyEmailThunk.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
        // Clear pending email — verification complete
        state.pendingVerificationEmail = null;
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("pendingVerificationEmail");
        }
      })
      .addCase(verifyEmailThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // resendEmailOtp
    builder
      .addCase(resendEmailOtpThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(resendEmailOtpThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // refresh
    builder
      .addCase(refreshTokenThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken ?? null;
        state.status = "succeeded";
      })
      .addCase(refreshTokenThunk.rejected, (state) => {
        // Refresh failed — treat as logged out
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.status = "idle";
      });

    // getMe
    builder
      .addCase(getMeThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      });

    // updateProfile
    builder
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const {
  hydrateFromStorage,
  loginSuccess,
  logout,
  clearAuthError,
  openAuthModal,
  closeAuthModal,
  clearPendingAction,
  setPendingVerificationEmail,
} = authSlice.actions;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.user);
export const selectIsAdmin = (state: RootState) =>
  state.auth.user?.role === "admin" || state.auth.user?.role === "superadmin";
export const selectAuthLoading = (state: RootState) =>
  state.auth.hydrating || state.auth.status === "loading";
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthHydrating = (state: RootState) => state.auth.hydrating;
export const selectIsAuthModalOpen = (state: RootState) => state.auth.isAuthModalOpen;
export const selectAuthModalTab = (state: RootState) => state.auth.authModalTab;
export const selectAuthModalMessage = (state: RootState) => state.auth.authModalMessage;
export const selectPendingAction = (state: RootState) => state.auth.pendingAction;
export const selectPendingVerificationEmail = (state: RootState) => state.auth.pendingVerificationEmail;

export default authSlice.reducer;
