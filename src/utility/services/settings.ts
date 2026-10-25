import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";

export interface DeliverySettings {
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  currency: string;
  currencySymbol: string;
  freeDeliveryMessage: string;
  estimatedDays: string;
}

export interface StoreInfoSettings {
  name: string;
  email: string;
  phone: string;
  supportEmail: string;
  address: string;
}

export interface AllSettings {
  delivery: DeliverySettings;
  storeInfo: StoreInfoSettings;
}

export const settingsService = {
  async getDeliverySettings(): Promise<DeliverySettings> {
    try {
      const res = await apiClient.get<ApiResponse<DeliverySettings>>(API_ENDPOINTS.SETTINGS.DELIVERY);
      return res.data;
    } catch {
      return {
        freeDeliveryThreshold: 40,
        standardDeliveryFee: 4,
        currency: "GBP",
        currencySymbol: "£",
        freeDeliveryMessage: "Free Delivery on Orders Over £40 | UK Wide",
        estimatedDays: "2–3 business days",
      };
    }
  },

  async getStoreInfo(): Promise<StoreInfoSettings> {
    try {
      const res = await apiClient.get<ApiResponse<StoreInfoSettings>>(API_ENDPOINTS.SETTINGS.STORE);
      return res.data;
    } catch {
      return {
        name: "Atlas",
        email: "returns@atlasone.com",
        phone: "07771142324",
        supportEmail: "returns@atlasone.com",
        address: "United Kingdom",
      };
    }
  },

  async getAllSettings(): Promise<AllSettings> {
    try {
      const res = await apiClient.get<ApiResponse<AllSettings>>(API_ENDPOINTS.SETTINGS.BASE);
      return res.data;
    } catch {
      return {
        delivery: {
          freeDeliveryThreshold: 40,
          standardDeliveryFee: 4,
          currency: "GBP",
          currencySymbol: "£",
          freeDeliveryMessage: "Free Delivery on Orders Over £40 | UK Wide",
          estimatedDays: "2–3 business days",
        },
        storeInfo: {
          name: "Atlas",
          email: "returns@atlasone.com",
          phone: "07771142324",
          supportEmail: "returns@atlasone.com",
          address: "United Kingdom",
        },
      };
    }
  },
};
