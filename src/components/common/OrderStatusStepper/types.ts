export type OrderStatusKey =
  | "pending"
  | "placed"
  | "confirmed"
  | "picking"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface StepItem {
  key: string;
  label: string;
  description?: string;
  timestamp?: string;
}

export interface OrderStatusStepperProps {
  currentStatus: OrderStatusKey | string;
  estimatedDelivery?: string;
  className?: string;
}
