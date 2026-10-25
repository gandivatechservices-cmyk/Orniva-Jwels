import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";

export interface PolicySection {
  id: string;
  heading: string;
  content: string;
  items?: string[];
}

export interface Policy {
  _id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  sections: PolicySection[];
  isActive: boolean;
  lastUpdated: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export const policiesService = {
  async getPolicies(): Promise<Policy[]> {
    const res = await apiClient.get<ApiResponse<Policy[]>>(API_ENDPOINTS.POLICIES.BASE);
    return res.data;
  },

  async getPolicyBySlug(slug: string): Promise<Policy> {
    const res = await apiClient.get<ApiResponse<Policy>>(API_ENDPOINTS.POLICIES.BY_SLUG(slug));
    return res.data;
  },
};
