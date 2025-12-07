/**
 * 图表配置类型定义
 */
export type ChartType = 'line' | 'bar' | 'scatter' | 'histogram';
export type XAxisType = 'string' | 'number';

export interface ChartConfig {
  chartType: ChartType;
  xField: string;
  yField: string;
  groupField?: string;
  xAxisType?: XAxisType; // X 轴数据类型：字符串或数字（仅用于散点图）
}

