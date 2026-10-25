export type SelectOption<T = string> = {
  value: T;
  label: string;
  disabled?: boolean;
  hint?: string;
};

export type SelectProps<T = string> = {
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  searchable?: boolean;
  fullWidth?: boolean;
  className?: string;
  id?: string;
};
