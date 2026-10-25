import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";

export type PresignPayload = { fileName: string; contentType: string; folder?: "products" | "reviews" };
export type PresignResult = { uploadUrl: string; publicUrl: string };

const unwrap = async <T>(request: Promise<ApiResponse<T>>) => (await request).data;

export const uploadsService = {
  presign: (payload: PresignPayload) =>
    unwrap(apiClient.post<ApiResponse<PresignResult>>(API_ENDPOINTS.UPLOADS.PRESIGN, payload)),
};
