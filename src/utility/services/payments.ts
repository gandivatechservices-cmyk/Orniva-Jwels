import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";
import type { Order } from "./orders";

const unwrap = async <T>(request: Promise<ApiResponse<T>>) => (await request).data;

export const paymentsService = {
  createCheckoutSession: (orderId: string, clientOrigin?: string) =>
    unwrap(
      apiClient.post<ApiResponse<{ url: string }>>(API_ENDPOINTS.PAYMENTS.CHECKOUT_SESSION, {
        orderId,
        clientOrigin,
      })
    ),

  verifySession: (orderId: string, sessionId?: string) =>
    unwrap(
      apiClient.post<ApiResponse<{ success: boolean; order: Order }>>(
        API_ENDPOINTS.PAYMENTS.VERIFY_SESSION,
        { orderId, sessionId }
      )
    ),

  cancelSession: (orderId: string) =>
    unwrap(
      apiClient.post<ApiResponse<{ success: boolean }>>(API_ENDPOINTS.PAYMENTS.CANCEL_SESSION, {
        orderId,
      })
    ),
};

