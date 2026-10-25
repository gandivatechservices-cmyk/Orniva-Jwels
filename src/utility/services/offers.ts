import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";

export type DiscountType = "percent" | "fixed" | "free_shipping" | "buy_x_get_y";
export type OfferScope = "cart" | "product" | "variant" | "category";
export type CouponEligibility = "all" | "new_customers" | "specific_users";

export type OfferTarget = {
  scope: OfferScope;
  productId?: string;
  variantIds?: string[];
  categoryId?: string;
};

export type BxgyConfig = {
  buyTarget: OfferTarget;
  buyQuantity: number;
  getTarget: OfferTarget;
  getQuantity: number;
  getDiscountPercent: number;
};

export type Coupon = {
  _id: string;
  domainId: string;
  code?: string;
  description: string;
  discountType: DiscountType;
  discountValue?: number;
  fixedAmountByCurrency?: Record<string, number>;
  maxDiscountAmount?: number;
  bxgy?: BxgyConfig;
  freeDelivery: boolean;
  targets: OfferTarget[];
  excludeTargets?: OfferTarget[];
  exclusiveToTargets: boolean;
  minCartValue?: number;
  minQuantity?: number;
  eligibility: CouponEligibility;
  eligibleUserIds?: string[];
  daysOfWeek?: number[];
  timeWindow?: { startHour: number; endHour: number };
  validFrom: string;
  validTo: string;
  stackable: boolean;
  usageLimit?: number;
  perUserLimit?: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponPayload = Omit<Coupon, "_id" | "timesUsed" | "createdAt" | "updatedAt">;

export type CartLineInput = { productId: string; variantId: string; quantity: number };

export type CouponValidationResult =
  | { valid: true; coupon: Coupon; discountAmount: number; freeDelivery: boolean; affectedVariantIds: string[] }
  | { valid: false; reason: string };

export type OfferEligibility = {
  couponId: string;
  code?: string;
  description: string;
  discountType: DiscountType;
  discountValue?: number;
  freeDelivery: boolean;
  eligible: boolean;
  discountAmount?: number;
  reason?: string;
  howToQualify?: string;
};

const unwrap = async <T>(request: Promise<ApiResponse<T>>) => (await request).data;

export const offersService = {
  listActive: (domainId: string) => unwrap(apiClient.get<ApiResponse<Coupon[]>>(API_ENDPOINTS.OFFERS.ACTIVE(domainId))),
  validate: (payload: { domainId: string; code?: string; cartLines: CartLineInput[] }) =>
    unwrap(apiClient.post<ApiResponse<CouponValidationResult>>(API_ENDPOINTS.OFFERS.VALIDATE, payload)),
  checkEligibility: (payload: { domainId: string; cartLines: CartLineInput[] }) =>
    unwrap(apiClient.post<ApiResponse<OfferEligibility[]>>(API_ENDPOINTS.OFFERS.ELIGIBILITY, payload)),
  list: (domainId?: string) => unwrap(apiClient.get<ApiResponse<Coupon[]>>(API_ENDPOINTS.OFFERS.BASE(domainId))),
  getById: (id: string) => unwrap(apiClient.get<ApiResponse<Coupon>>(API_ENDPOINTS.OFFERS.BY_ID(id))),
  create: (payload: Partial<CouponPayload>) => unwrap(apiClient.post<ApiResponse<Coupon>>(API_ENDPOINTS.OFFERS.BASE(), payload)),
  update: (id: string, payload: Partial<CouponPayload>) => unwrap(apiClient.patch<ApiResponse<Coupon>>(API_ENDPOINTS.OFFERS.BY_ID(id), payload)),
  remove: (id: string) => apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.OFFERS.BY_ID(id)),
};
