export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface RevenueChartProps {
  data: ChartDataPoint[];
  currency?: string;
  title?: string;
  totalRevenue?: number;
  loading?: boolean;
  className?: string;
}
