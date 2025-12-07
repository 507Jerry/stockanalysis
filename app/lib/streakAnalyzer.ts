/**
 * 趋势连续分析器
 * 分析股票数据的连续涨跌趋势
 */

/**
 * 连续段数据结构（包含价格信息）
 */
export interface StreakSegment {
  type: 'up' | 'down';
  days: number;
  percent: number;
  startIndex: number;
  endIndex: number;
  dates?: string[]; // 可选的日期数组
  // 价格信息
  startPrice?: number | null;
  endPrice?: number | null;
  priceChange?: number | null;
  priceChangePercent?: number | null;
}

/**
 * 恢复时间分析结果（包含价格信息）
 */
export interface RecoveryAnalysis {
  recovered: boolean;
  recoveryDays: number | null;
  recoveryDate: string | null;
  recoveryPrice?: number | null; // 恢复时的价格
  recoveryPercent?: number | null; // 恢复百分比（相对于结束价格）
  // 连续段的价格信息
  startPrice?: number | null; // 连续段起始价格
  endPrice?: number | null; // 连续段结束价格
  priceChange?: number | null; // 涨跌金额
  priceChangePercent?: number | null; // 涨跌百分比
}

/**
 * 首次恢复周期统计信息（包含价格信息）
 */
export interface FirstRecoveryStats {
  streakType: 'up' | 'down';
  streakDays: number;
  streakPercent: number;
  firstRecoveryDays: number | null;
  firstRecoveryPercent: number | null;
  startDate: string;
  endDate: string;
  recoveryDate: string | null;
  // 价格信息
  startPrice: number | null;
  endPrice: number | null;
  priceChange: number | null;
  priceChangePercent: number | null;
  recoveryPrice: number | null;
}

/**
 * 趋势分析结果（包含恢复时间）
 */
export interface StreakAnalysisResult {
  streaks: StreakSegment[];
  maxUp: StreakSegment | null;
  maxDown: StreakSegment | null;
  recovery: {
    upRecovery: RecoveryAnalysis;
    downRecovery: RecoveryAnalysis;
  };
  longestFirstRecovery: FirstRecoveryStats | null; // 首次恢复周期最长的段
}

/**
 * 分析连续涨跌趋势（包含恢复时间分析）
 * @param dailyChanges - 每日涨跌幅数组（pct_change）
 * @param dates - 可选的日期数组，用于标记连续段的日期范围
 * @param closePrices - 收盘价数组（用于计算恢复时间）
 * @returns 趋势分析结果
 */
export function analyzeStreaks(
  dailyChanges: number[],
  dates?: string[],
  closePrices?: number[]
): StreakAnalysisResult {
  if (dailyChanges.length === 0) {
    return {
      streaks: [],
      maxUp: null,
      maxDown: null,
      recovery: {
        upRecovery: {
          recovered: false,
          recoveryDays: null,
          recoveryDate: null,
        },
        downRecovery: {
          recovered: false,
          recoveryDays: null,
          recoveryDate: null,
        },
      },
      longestFirstRecovery: null,
    };
  }

  const streaks: StreakSegment[] = [];
  let current: {
    type: 'up' | 'down' | null;
    days: number;
    factor: number;
    startIndex: number;
  } = {
    type: null,
    days: 0,
    factor: 1,
    startIndex: 0,
  };

  for (let i = 0; i < dailyChanges.length; i++) {
    const change = dailyChanges[i];
    const sign: 'up' | 'down' = change >= 0 ? 'up' : 'down';

    if (current.type === sign) {
      // 继续当前连续段
      current.days++;
      current.factor *= 1 + change / 100;
    } else {
      // 结束当前连续段，开始新段
      if (current.type !== null && current.days > 0) {
        const segment: StreakSegment = {
          type: current.type,
          days: current.days,
          percent: (current.factor - 1) * 100,
          startIndex: current.startIndex,
          endIndex: i - 1,
        };

        // 如果有日期数组，添加日期范围
        if (dates && dates.length > 0) {
          segment.dates = dates.slice(current.startIndex, i);
        }

        streaks.push(segment);
      }

      // 开始新连续段
      current = {
        type: sign,
        days: 1,
        factor: 1 + change / 100,
        startIndex: i,
      };
    }
  }

  // 添加最后一个连续段
  if (current.type !== null && current.days > 0) {
    const segment: StreakSegment = {
      type: current.type,
      days: current.days,
      percent: (current.factor - 1) * 100,
      startIndex: current.startIndex,
      endIndex: dailyChanges.length - 1,
    };

    if (dates && dates.length > 0) {
      segment.dates = dates.slice(current.startIndex);
    }

    streaks.push(segment);
  }

  // 找出最长上涨和下跌连续段
  const upStreaks = streaks.filter((s) => s.type === 'up');
  const downStreaks = streaks.filter((s) => s.type === 'down');

  const maxUp =
    upStreaks.length > 0
      ? upStreaks.reduce((a, b) => (a.days > b.days ? a : b))
      : null;

  const maxDown =
    downStreaks.length > 0
      ? downStreaks.reduce((a, b) => (a.days > b.days ? a : b))
      : null;

  // 计算恢复时间
  let upRecovery: RecoveryAnalysis = {
    recovered: false,
    recoveryDays: null,
    recoveryDate: null,
  };
  let downRecovery: RecoveryAnalysis = {
    recovered: false,
    recoveryDays: null,
    recoveryDate: null,
  };

  let longestFirstRecovery: FirstRecoveryStats | null = null;

  if (closePrices && closePrices.length > 0) {
    if (maxUp) {
      upRecovery = calculateRecoveryDays(closePrices, maxUp, dates);
    }
    if (maxDown) {
      downRecovery = calculateRecoveryDays(closePrices, maxDown, dates);
    }

    // 计算所有连续段的首次恢复周期
    const allFirstRecoveries = calculateAllFirstRecoveries(
      streaks,
      closePrices,
      dates
    );

    // 找出首次恢复周期最长的段
    longestFirstRecovery = findLongestFirstRecovery(allFirstRecoveries);
  }

  return {
    streaks,
    maxUp,
    maxDown,
    recovery: {
      upRecovery,
      downRecovery,
    },
    longestFirstRecovery,
  };
}

/**
 * 从数据行中提取 pct_change 数组
 * @param rows - 数据行
 * @param dateField - 日期字段名（可选）
 * @returns 包含 pct_change 数组和日期数组的对象，以及索引映射
 */
export function extractStreakData(
  rows: Array<Record<string, any>>,
  dateField?: string
): {
  pctChanges: number[];
  dates: string[];
  indexMap: number[]; // 原始行索引到 pctChanges 数组索引的映射
} {
  const pctChanges: number[] = [];
  const dates: string[] = [];
  const indexMap: number[] = [];

  rows.forEach((row, originalIndex) => {
    const pctChange = parseFloat(row.pct_change);
    if (!isNaN(pctChange) && isFinite(pctChange)) {
      pctChanges.push(pctChange);
      indexMap.push(originalIndex); // 记录原始索引
      if (dateField && row[dateField]) {
        dates.push(String(row[dateField]));
      }
    }
  });

  return { pctChanges, dates, indexMap };
}

/**
 * 从数据行中提取收盘价数组
 * @param rows - 数据行
 * @returns 收盘价数组（与原始行索引对应）
 */
export function extractClosePrices(
  rows: Array<Record<string, any>>
): number[] {
  const closePrices: number[] = [];

  // 尝试不同的字段名（大小写不敏感）
  const closeField =
    rows.length > 0
      ? Object.keys(rows[0]).find(
          (key) => key.toLowerCase() === 'close'
        ) || 'Close'
      : 'Close';

  rows.forEach((row) => {
    const closePrice = parseFloat(row[closeField]);
    if (!isNaN(closePrice) && isFinite(closePrice)) {
      closePrices.push(closePrice);
    } else {
      closePrices.push(NaN); // 保持索引对应
    }
  });

  return closePrices;
}

/**
 * 判断数据点是否属于指定的连续段
 * @param index - 数据点索引
 * @param streak - 连续段
 * @returns 是否属于该连续段
 */
export function isInStreak(index: number, streak: StreakSegment): boolean {
  return index >= streak.startIndex && index <= streak.endIndex;
}

/**
 * 计算恢复时间：价格恢复到连续段开始前的水平所需的天数
 * @param closePrices - 收盘价数组
 * @param streak - 连续段
 * @param dates - 日期数组（可选）
 * @returns 恢复分析结果
 */
/**
 * 计算恢复时间：价格恢复到连续段开始前的水平所需的天数
 * 
 * 恢复定义（严格按照要求）：
 * - 上涨段恢复：Close[i] <= Close[startIndex]（回落到或低于起始价格）
 * - 下跌段恢复：Close[i] >= Close[startIndex]（回升到或高于起始价格）
 * 
 * @param closePrices - 收盘价数组
 * @param streak - 连续段
 * @param dates - 日期数组（可选）
 * @returns 恢复分析结果（包含完整价格信息）
 */
export function calculateRecoveryDays(
  closePrices: number[],
  streak: StreakSegment | null,
  dates?: string[]
): RecoveryAnalysis {
  if (!streak || streak.startIndex >= closePrices.length || streak.startIndex < 0) {
    return {
      recovered: false,
      recoveryDays: null,
      recoveryDate: null,
      recoveryPrice: null,
      recoveryPercent: null,
      startPrice: null,
      endPrice: null,
      priceChange: null,
      priceChangePercent: null,
    };
  }

  const P_start = closePrices[streak.startIndex];
  
  // 检查起始价格是否有效
  if (isNaN(P_start) || !isFinite(P_start)) {
    return {
      recovered: false,
      recoveryDays: null,
      recoveryDate: null,
      recoveryPrice: null,
      recoveryPercent: null,
      startPrice: null,
      endPrice: null,
      priceChange: null,
      priceChangePercent: null,
    };
  }

  const endIndex = streak.endIndex;
  const P_end = closePrices[endIndex];

  // 计算价格信息
  let startPrice: number | null = P_start;
  let endPrice: number | null = null;
  let priceChange: number | null = null;
  let priceChangePercent: number | null = null;

  if (!isNaN(P_end) && isFinite(P_end)) {
    endPrice = P_end;
    priceChange = P_end - P_start;
    priceChangePercent = (priceChange / P_start) * 100;
  }

  // 从连续段结束后的第一天开始检查
  for (let i = endIndex + 1; i < closePrices.length; i++) {
    const currentPrice = closePrices[i];
    
    // 跳过无效价格
    if (isNaN(currentPrice) || !isFinite(currentPrice)) {
      continue;
    }
    
    // 根据连续段类型检查恢复条件（严格按照定义）
    let recoveryFound = false;
    
    if (streak.type === 'up') {
      // 上涨段恢复：Close[i] <= Close[startIndex]
      if (currentPrice <= P_start) {
        recoveryFound = true;
      }
    } else {
      // 下跌段恢复：Close[i] >= Close[startIndex]
      if (currentPrice >= P_start) {
        recoveryFound = true;
      }
    }
    
    if (recoveryFound) {
      // 计算恢复百分比（相对于结束价格）
      const recoveryPercent =
        endPrice !== null && endPrice > 0
          ? ((currentPrice - endPrice) / endPrice) * 100
          : null;

      return {
        recovered: true,
        recoveryDays: i - endIndex,
        recoveryDate: dates && i < dates.length && dates[i] ? dates[i] : null,
        recoveryPrice: currentPrice,
        recoveryPercent,
        startPrice,
        endPrice,
        priceChange,
        priceChangePercent,
      };
    }
  }

  return {
    recovered: false,
    recoveryDays: null,
    recoveryDate: null,
    recoveryPrice: null,
    recoveryPercent: null,
    startPrice,
    endPrice,
    priceChange,
    priceChangePercent,
  };
}

/**
 * 计算首次恢复周期：对于上涨段，找到第一个价格回落到或低于起始价格的日子；
 * 对于下跌段，找到第一个价格回升到或高于起始价格的日子
 * @param closePrices - 收盘价数组
 * @param streak - 连续段
 * @param dates - 日期数组（可选）
 * @returns 首次恢复分析结果
 */
export function calculateFirstRecovery(
  closePrices: number[],
  streak: StreakSegment | null,
  dates?: string[]
): {
  firstRecoveryDays: number | null;
  firstRecoveryPercent: number | null;
  recoveryDate: string | null;
} {
  if (!streak || streak.startIndex >= closePrices.length || streak.startIndex < 0) {
    return {
      firstRecoveryDays: null,
      firstRecoveryPercent: null,
      recoveryDate: null,
      recoveryPrice: null,
    };
  }

  const startPrice = closePrices[streak.startIndex];
  const endIndex = streak.endIndex;
  const endPrice = closePrices[endIndex];

  // 检查起始价格和结束价格是否有效
  if (
    isNaN(startPrice) ||
    !isFinite(startPrice) ||
    isNaN(endPrice) ||
    !isFinite(endPrice) ||
    endPrice <= 0
  ) {
    return {
      firstRecoveryDays: null,
      firstRecoveryPercent: null,
      recoveryDate: null,
      recoveryPrice: null,
    };
  }

  // 从连续段结束后的第一天开始检查
  for (let i = endIndex + 1; i < closePrices.length; i++) {
    const currentPrice = closePrices[i];

    // 跳过无效价格
    if (isNaN(currentPrice) || !isFinite(currentPrice)) {
      continue;
    }

    let recoveryFound = false;

    // 对于上涨段：找到第一个价格回落到或低于起始价格的日子
    if (streak.type === 'up' && currentPrice <= startPrice) {
      recoveryFound = true;
    }
    // 对于下跌段：找到第一个价格回升到或高于起始价格的日子
    else if (streak.type === 'down' && currentPrice >= startPrice) {
      recoveryFound = true;
    }

    if (recoveryFound) {
      // 计算恢复百分比
      const recoveryPercent = ((currentPrice - endPrice) / endPrice) * 100;

      return {
        firstRecoveryDays: i - endIndex,
        firstRecoveryPercent: recoveryPercent,
        recoveryDate: dates && i < dates.length && dates[i] ? dates[i] : null,
        recoveryPrice: currentPrice,
      };
    }
  }

  return {
    firstRecoveryDays: null,
    firstRecoveryPercent: null,
    recoveryDate: null,
    recoveryPrice: null,
  };
}

/**
 * 计算所有连续段的首次恢复统计信息（包含价格信息）
 * @param streaks - 所有连续段
 * @param closePrices - 收盘价数组
 * @param dates - 日期数组（可选）
 * @returns 所有连续段的首次恢复统计信息
 */
export function calculateAllFirstRecoveries(
  streaks: StreakSegment[],
  closePrices: number[],
  dates?: string[]
): FirstRecoveryStats[] {
  return streaks.map((streak) => {
    const recovery = calculateFirstRecovery(closePrices, streak, dates);

    const startDate =
      streak.dates && streak.dates.length > 0
        ? streak.dates[0]
        : dates && dates[streak.startIndex]
        ? dates[streak.startIndex]
        : '';

    const endDate =
      streak.dates && streak.dates.length > 0
        ? streak.dates[streak.dates.length - 1]
        : dates && dates[streak.endIndex]
        ? dates[streak.endIndex]
        : '';

    // 计算价格信息
    const P_start = closePrices[streak.startIndex];
    const P_end = closePrices[streak.endIndex];
    
    let startPrice: number | null = null;
    let endPrice: number | null = null;
    let priceChange: number | null = null;
    let priceChangePercent: number | null = null;
    let recoveryPrice: number | null = null;

    if (!isNaN(P_start) && isFinite(P_start)) {
      startPrice = P_start;
    }
    if (!isNaN(P_end) && isFinite(P_end)) {
      endPrice = P_end;
    }

    if (startPrice !== null && endPrice !== null) {
      priceChange = endPrice - startPrice;
      priceChangePercent = (priceChange / startPrice) * 100;
    }

    // 如果有恢复，使用计算出的恢复价格
    if (recovery.recoveryPrice !== null && !isNaN(recovery.recoveryPrice) && isFinite(recovery.recoveryPrice)) {
      recoveryPrice = recovery.recoveryPrice;
    }

    return {
      streakType: streak.type,
      streakDays: streak.days,
      streakPercent: streak.percent,
      firstRecoveryDays: recovery.firstRecoveryDays,
      firstRecoveryPercent: recovery.firstRecoveryPercent,
      startDate,
      endDate,
      recoveryDate: recovery.recoveryDate,
      // 价格信息
      startPrice,
      endPrice,
      priceChange,
      priceChangePercent,
      recoveryPrice,
    };
  });
}

/**
 * 找出首次恢复周期最长的连续段
 * @param allFirstRecoveries - 所有首次恢复统计信息
 * @returns 首次恢复周期最长的段，如果没有已恢复的段则返回 null
 */
export function findLongestFirstRecovery(
  allFirstRecoveries: FirstRecoveryStats[]
): FirstRecoveryStats | null {
  const recoveredStats = allFirstRecoveries.filter(
    (s) => s.firstRecoveryDays !== null
  );

  if (recoveredStats.length === 0) {
    return null;
  }

  return recoveredStats.reduce((a, b) => {
    const aDays = a.firstRecoveryDays ?? 0;
    const bDays = b.firstRecoveryDays ?? 0;
    return bDays > aDays ? b : a;
  });
}

