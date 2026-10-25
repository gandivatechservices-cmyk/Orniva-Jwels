import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";

export type LoginPayload = { email: string; password: string };
export type AuthTokens = { accessToken: string; refreshToken: string };
export type User = {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  role: "customer" | "admin" | "superadmin";
  addresses?: Address[];
};

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string;
};

export type RegisterPayload = { name: string; email: string; password: string };

/** Response from POST /auth/register — email verification now required */
export type RegisterResponse = { message: string; emailVerified: boolean };

/** Response from POST /auth/verify-email */
export type VerifyEmailResponse = { message: string; emailVerified: boolean };

export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  role?: "customer" | "admin" | "superadmin";
  addresses?: Address[];
};

const unwrap = async <T>(request: Promise<ApiResponse<T>>) => (await request).data;

export const authService = {
  login: (payload: LoginPayload) =>
    unwrap(apiClient.post<ApiResponse<AuthTokens>>(API_ENDPOINTS.AUTH.LOGIN, payload)),

  register: (payload: RegisterPayload) =>
    unwrap(apiClient.post<ApiResponse<RegisterResponse>>(API_ENDPOINTS.AUTH.REGISTER, payload)),

  refresh: (refreshToken: string) =>
    unwrap(apiClient.post<ApiResponse<AuthTokens>>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })),

  getMe: () =>
    unwrap(apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS.ME)),

  forgotPassword: (email: string) =>
    unwrap(apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email })),

  verifyResetCode: (email: string, code: string) =>
    unwrap(apiClient.post<ApiResponse<{ resetToken: string }>>(API_ENDPOINTS.AUTH.VERIFY_RESET_CODE, { email, code })),

  resetPassword: (email: string, token: string, password: string) =>
    unwrap(apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, token, password })),

  /** POST /auth/verify-email — validates the 6-digit OTP */
  verifyEmail: (email: string, otp: string) =>
    unwrap(apiClient.post<ApiResponse<VerifyEmailResponse>>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, otp })),

  /** POST /auth/resend-email-otp — requests a new OTP (60-second cooldown enforced server-side) */
  resendEmailOtp: (email: string) =>
    unwrap(apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.RESEND_EMAIL_OTP, { email })),
};