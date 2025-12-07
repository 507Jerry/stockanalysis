/**
 * 数据转换与派生字段计算逻辑
 */

/**
 * 检查字段是否为数值类型
 * @param value - 要检查的值
 * @returns 是否为数值
 */
export function isNumeric(value: any): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * 判断字段是否为数值型字段（通过抽样检查）
 * @param rows - 数据行
 * @param fieldName - 字段名
 * @returns 是否为数值型字段
 */
export function isNumericField(
  rows: Array<Record<string, any>>,
  fieldName: string
): boolean {
  if (rows.length === 0) return false;
  
  // 抽样检查前 10 行（或全部行，如果少于 10 行）
  const sampleSize = Math.min(10, rows.length);
  let numericCount = 0;
  
  for (let i = 0; i < sampleSize; i++) {
    if (isNumeric(rows[i][fieldName])) {
      numericCount++;
    }
  }
  
  // 如果超过 80% 的样本是数值，则认为该字段是数值型
  return numericCount / sampleSize >= 0.8;
}

/**
 * 获取所有数值型字段
 * @param rows - 数据行
 * @param columns - 字段列表
 * @returns 数值型字段列表
 */
export function getNumericFields(
  rows: Array<Record<string, any>>,
  columns: string[]
): string[] {
  return columns.filter((col) => isNumericField(rows, col));
}

/**
 * 检查字段名是否存在（大小写不敏感）
 * @param columns - 字段列表
 * @param fieldName - 要查找的字段名
 * @returns 匹配的字段名（原始大小写），如果不存在则返回 null
 */
export function findFieldIgnoreCase(
  columns: string[],
  fieldName: string
): string | null {
  const lowerFieldName = fieldName.toLowerCase();
  return columns.find((col) => col.toLowerCase() === lowerFieldName) || null;
}

/**
 * 添加派生字段 pct_change = (close - open) / open * 100
 * @param rows - 原始数据行
 * @param columns - 原始字段列表
 * @returns 包含派生字段的新数据和字段列表
 */
export function addDerivedFields(
  rows: Array<Record<string, any>>,
  columns: string[]
): {
  rows: Array<Record<string, any>>;
  columns: string[];
} {
  const openField = findFieldIgnoreCase(columns, 'open');
  const closeField = findFieldIgnoreCase(columns, 'close');
  
  // 如果同时存在 open 和 close 字段，添加 pct_change 派生字段
  if (openField && closeField) {
    const newRows = rows.map((row) => {
      const open = parseFloat(row[openField]);
      const close = parseFloat(row[closeField]);
      
      let pctChange = null;
      if (isNumeric(open) && isNumeric(close) && open !== 0) {
        pctChange = ((close - open) / open) * 100;
      }
      
      return {
        ...row,
        pct_change: pctChange,
      };
    });
    
    const newColumns = [...columns, 'pct_change'];
    
    return {
      rows: newRows,
      columns: newColumns,
    };
  }
  
  return {
    rows,
    columns,
  };
}

/**
 * 计算统计摘要
 */
export interface SummaryStats {
  count: number;
  mean: number;
  std: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  max: number;
}

/**
 * 计算字段的统计摘要
 * @param rows - 数据行
 * @param fieldName - 字段名
 * @returns 统计摘要
 */
export function calculateSummaryStats(
  rows: Array<Record<string, any>>,
  fieldName: string
): SummaryStats | null {
  const values = rows
    .map((row) => parseFloat(row[fieldName]))
    .filter((val) => !isNaN(val) && isFinite(val));
  
  if (values.length === 0) {
    return null;
  }
  
  // 排序
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  
  // 计算均值
  const mean = sorted.reduce((sum, val) => sum + val, 0) / count;
  
  // 计算标准差
  const variance =
    sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count;
  const std = Math.sqrt(variance);
  
  // 计算分位数
  const getPercentile = (arr: number[], p: number): number => {
    const index = (arr.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return arr[lower] * (1 - weight) + arr[upper] * weight;
  };
  
  return {
    count,
    mean: Number(mean.toFixed(4)),
    std: Number(std.toFixed(4)),
    min: sorted[0],
    q25: getPercentile(sorted, 0.25),
    median: getPercentile(sorted, 0.5),
    q75: getPercentile(sorted, 0.75),
    max: sorted[sorted.length - 1],
  };
}

