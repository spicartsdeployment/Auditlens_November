declare module 'recharts' {
  import type { ComponentType, ReactNode } from 'react'
  export const BarChart: ComponentType<any>
  export const Bar: ComponentType<any>
  export const XAxis: ComponentType<any>
  export const YAxis: ComponentType<any>
  export const Tooltip: ComponentType<any>
  export const ResponsiveContainer: ComponentType<{ width?: string | number; height?: string | number; children?: ReactNode }>
  export const PieChart: ComponentType<any>
  export const Pie: ComponentType<any>
  export const Cell: ComponentType<any>
  export const Legend: ComponentType<any>
}
