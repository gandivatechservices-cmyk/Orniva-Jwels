import { apiClient, type ApiResponse } from "utility/services/base";
import { API_ENDPOINTS } from "constants/apiEndpoints";

export type OrderItem = {
  productId: string;
  variantId: string;
  name: string;
  sku?: string;
  image?: string;
  attributes: Record<string, string>;
  price: number;
  quantity: number;
  freeQty?: number;
};

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  phone?: string;
};

export type OrderCustomer = {
  _id: string;
  name: string;
  email: string;
};

export type OrderHistoryAction =
  | "created"
  | "updated"
  | "accepted"
  | "cancelled"
  | "shipped"
  | "shipment_edited"
  | "shipment_undone"
  | "delivered"
  | "delivery_undone"
  | "refunded";

export type OrderHistoryEntry = {
  action: OrderHistoryAction;
  description: string;
  actorUserId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  at: string;
};

export type AppliedOffer = {
  couponId?: string;
  /** Missing for auto-applied offers */
  code?: string;
  description?: string;
  discountType?: "percent" | "fixed" | "free_shipping" | "buy_x_get_y";
  discountValue?: number;
  freeDelivery: boolean;
};

export type Order = {
  _id: string;
  userId: string | OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee?: number;
  couponCode?: string;
  /** Snapshot of the offer applied at checkout (orders placed before this existed only have couponCode) */
  appliedOffer?: AppliedOffer;
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  currency: string;
  baseCurrency: string;
  shippingAddress: ShippingAddress;
  paymentMethod: "card" | "cod";
  shipmentProvider: string;
  carrierName?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  adminNote?: string;
  totalRefunded: number;
  history: OrderHistoryEntry[];
  createdAt: string;
  updatedAt: string;
};

export type RefundMethod = "bank_transfer" | "cash" | "original_payment_method" | "store_credit" | "other";

export type Refund = {
  _id: string;
  orderId: string;
  userId: string;
  amount: number;
  reason: string;
  method: RefundMethod;
  referenceNumber?: string;
  notes?: string;
  processedByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceItem = {
  name: string;
  sku?: string;
  attributes: Record<string, string>;
  price: number;
  quantity: number;
  freeQty: number;
  paidQty: number;
  lineTotal: number;
};

export type InvoiceData = {
  invoiceNumber: string;
  orderRef: string;
  orderId: string;
  orderDate: string;
  issuedDate: string;
  customer: { name: string; email: string };
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee?: number;
  couponCode?: string;
  total: number;
  currency: string;
  status: string;
  trackingNumber?: string;
  carrierName?: string;
};

const unwrap = async <T>(request: Promise<ApiResponse<T>>) => (await request).data;

export const ordersService = {
  create: (shippingAddress: ShippingAddress, couponCode?: string, paymentMethod?: "card" | "cod") =>
    unwrap(
      apiClient.post<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.BASE, {
        shippingAddress,
        ...(couponCode ? { couponCode } : {}),
        ...(paymentMethod ? { paymentMethod } : {}),
      })
    ),
  list: () => unwrap(apiClient.get<ApiResponse<Order[]>>(API_ENDPOINTS.ORDERS.BASE)),
  listAdmin: () => unwrap(apiClient.get<ApiResponse<Order[]>>(API_ENDPOINTS.ORDERS.ADMIN)),
  getById: (id: string) => unwrap(apiClient.get<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.BY_ID(id))),
  getInvoice: (id: string) => unwrap(apiClient.get<ApiResponse<InvoiceData>>(API_ENDPOINTS.ORDERS.INVOICE(id))),
  update: (id: string, updates: { shippingAddress?: ShippingAddress; adminNote?: string }) =>
    unwrap(apiClient.patch<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.BY_ID(id), updates)),
  accept: (id: string) => unwrap(apiClient.patch<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.ACCEPT(id), {})),
  cancel: (id: string, reason?: string) =>
    unwrap(apiClient.patch<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.CANCEL(id), reason ? { reason } : {})),
  ship: (id: string, details: { carrierName?: string; trackingNumber?: string }) =>
    unwrap(apiClient.patch<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.SHIP(id), details)),
  undoShip: (id: string) => unwrap(apiClient.patch<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.UNDO_SHIP(id), {})),
  deliver: (id: string) => unwrap(apiClient.patch<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.DELIVER(id), {})),
  undoDeliver: (id: string) => unwrap(apiClient.patch<ApiResponse<Order>>(API_ENDPOINTS.ORDERS.UNDO_DELIVER(id), {})),
  createRefund: (
    id: string,
    refund: { amount: number; reason: string; method: RefundMethod; referenceNumber?: string; notes?: string },
  ) => unwrap(apiClient.post<ApiResponse<Refund>>(API_ENDPOINTS.ORDERS.REFUNDS(id), refund)),
  listRefunds: (id: string) => unwrap(apiClient.get<ApiResponse<Refund[]>>(API_ENDPOINTS.ORDERS.REFUNDS(id))),
};
