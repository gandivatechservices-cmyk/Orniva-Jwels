export type QuantityStepperSize = "sm" | "md" | "lg";

export type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: QuantityStepperSize;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
};
