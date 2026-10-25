import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";

export type ReviewImage = { _id: string; url: string; isActive: boolean };
export type ReviewUser = {
  _id: string;
  name: string;
  email?: string;
  role?: string;
};

export type Review = {
  _id: string;
  productId: string;
  userId: string | ReviewUser;
  user?: ReviewUser;
  rating: number;
  comment?: string;
  images: ReviewImage[];
  isActive: boolean;
  isVerifiedBuyer?: boolean;
  createdAt: string;
  updatedAt: string;
};

export function getReviewerName(review: Review): string {
  if (typeof review.userId === "object" && review.userId && review.userId.name) {
    return review.userId.name;
  }
  if (review.user && review.user.name) {
    return review.user.name;
  }
  return "Verified Customer";
}

export type ReviewStats = {
  average: number;
  count: number;
  breakdown: Record<number, number>;
};

export type PaginatedReviews = {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  stats?: ReviewStats;
};

export type CreateReviewPayload = { productId: string; rating: number; comment?: string; images?: string[] };
export type UpdateReviewPayload = { rating?: number; comment?: string; images?: string[]; isActive?: boolean };

const unwrap = async <T>(request: Promise<ApiResponse<T>>) => (await request).data;

export const reviewsService = {
  list: (params: {
    productId?: string;
    page?: number;
    limit?: number;
    sortBy?: "newest" | "highest" | "lowest" | "oldest";
    rating?: number;
  } = {}) =>
    unwrap(apiClient.get<ApiResponse<PaginatedReviews>>(API_ENDPOINTS.REVIEWS.BASE(params))),
  listMine: () => unwrap(apiClient.get<ApiResponse<Review[]>>(API_ENDPOINTS.REVIEWS.MINE)),
  listAdmin: (params: { productId?: string; includeInactive?: boolean; page?: number; limit?: number } = {}) =>
    unwrap(apiClient.get<ApiResponse<PaginatedReviews>>(API_ENDPOINTS.REVIEWS.ADMIN(params))),
  create: (payload: CreateReviewPayload) => unwrap(apiClient.post<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.BASE(), payload)),
  update: (id: string, payload: UpdateReviewPayload) => unwrap(apiClient.patch<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.BY_ID(id), payload)),
  remove: (id: string) => apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.REVIEWS.BY_ID(id)),
  setImageStatus: (id: string, imageId: string, isActive: boolean) =>
    unwrap(apiClient.patch<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.IMAGE_STATUS(id, imageId), { isActive })),
};
