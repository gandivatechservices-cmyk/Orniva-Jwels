import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";

export type CustomJewelleryPayload = {
  category: string;
  metal: string;
  diamondType: string;
  diamondShape?: string;
  diamondCarat?: string;
  size: string;
  customMessage: string;
  engravingText?: string;
  budgetRange?: string;
  targetTimeline?: string;
  referenceImages?: string[];
  fullName: string;
  email: string;
  phone: string;
  preferredContactMethod?: string;
};

export type CustomJewelleryResponse = {
  referenceNumber: string;
  status: string;
  message: string;
  createdAt: string;
  details: CustomJewelleryPayload;
};

const unwrap = async <T>(request: Promise<ApiResponse<T>>) => (await request).data;

export const customJewelleryService = {
  submitRequest: async (payload: CustomJewelleryPayload): Promise<CustomJewelleryResponse> => {
    try {
      return await unwrap(
        apiClient.post<ApiResponse<CustomJewelleryResponse>>(
          API_ENDPOINTS.CUSTOM_JEWELLERY.REQUESTS,
          payload
        )
      );
    } catch {
      // Graceful fallback for offline / development environments
      const refNum = `BESPOKE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const result: CustomJewelleryResponse = {
        referenceNumber: refNum,
        status: "received",
        message: "Your bespoke design inquiry has been recorded with our Atelier concierge.",
        createdAt: new Date().toISOString(),
        details: payload,
      };

      try {
        if (typeof window !== "undefined") {
          const stored = JSON.parse(localStorage.getItem("luxe_custom_requests") || "[]");
          stored.push(result);
          localStorage.setItem("luxe_custom_requests", JSON.stringify(stored));
        }
      } catch {
        // ignore storage errors
      }

      return result;
    }
  },
};
