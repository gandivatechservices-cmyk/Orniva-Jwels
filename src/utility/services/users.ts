import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";
import type { User, UpdateProfilePayload } from "utility/services/auth";

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role?: "customer" | "admin" | "superadmin";
};

export type UserRole = "customer" | "admin" | "superadmin";

const unwrap = async <T>(request: Promise<ApiResponse<T>>) => (await request).data;

export const usersService = {
  /** Admin: list all users */
  list: () => unwrap(apiClient.get<ApiResponse<User[]>>(API_ENDPOINTS.USERS.BASE)),

  /** Admin: create a new user */
  create: (payload: CreateUserPayload) =>
    unwrap(apiClient.post<ApiResponse<User>>(API_ENDPOINTS.USERS.BASE, payload)),

  /** Admin: get user by ID */
  getById: (id: string) => unwrap(apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS.BY_ID(id))),

  /** Admin: update any user's fields (role, name, email, addresses) */
  update: (id: string, payload: UpdateProfilePayload & { role?: UserRole }) =>
    unwrap(apiClient.patch<ApiResponse<User>>(API_ENDPOINTS.USERS.BY_ID(id), payload)),

  /** Admin: update a user's role specifically */
  updateRole: (id: string, role: UserRole) =>
    unwrap(apiClient.patch<ApiResponse<User>>(API_ENDPOINTS.USERS.BY_ID(id), { role })),

  /** Admin: delete a user */
  remove: (id: string) => apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.USERS.BY_ID(id)),

  /** Authenticated user: update own profile (name, email, addresses — NOT password or role) */
  updateMe: (payload: UpdateProfilePayload) =>
    unwrap(apiClient.patch<ApiResponse<User>>(API_ENDPOINTS.USERS.ME, payload)),
};
