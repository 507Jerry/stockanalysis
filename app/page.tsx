/**
 * 主页面
 * 整合所有组件，实现数据可视化工作台
 */
'use client';

import React, { useState, useMemo } from 'react';
import Layout from '@/app/components/Layout';
import DataUploader from '@/app/components/DataUploader';
import DataPreview from '@/app/components/DataPreview';
import ControlPanel from '@/app/components/ControlPanel';
import ChartRenderer from '@/app/components/ChartRenderer';
import SummaryStats from '@/app/components/SummaryStats';
import StreakSummaryCards from '@/app/components/StreakSummaryCards';
import { ChartConfig } from '@/app/lib/types';
import { addDerivedFields } from '@/app/lib/transform';
import {
  analyzeStreaks,
  extractStreakData,
  extractClosePrices,
  calculateRecoveryDays,
  calculateAllFirstRecoveries,
  findLongestFirstRecovery,
  StreakAnalysisResult,
} from '@/app/lib/streakAnalyzer';

export default function Home() {
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    chartType: 'line',
    xField: '',
    yField: '',
    groupField: undefined,
    xAxisType: undefined,
  });
  const [activeChartConfig, setActiveChartConfig] = useState<ChartConfig | null>(null);

  // 自动进行趋势分析（当数据包含 pct_change 字段时）
  const streakAnalysis = useMemo<StreakAnalysisResult | undefined>(() => {
    if (rows.length === 0) return undefined;

    // 检查是否有 pct_change 字段
    const hasPctChange = columns.includes('pct_change');
    if (!hasPctChange) return undefined;

    // 查找日期字段
    const dateField =
      columns.find((col) =>
        col.toLowerCase().includes('date') || col.toLowerCase().includes('time')
      ) || columns[0];

    // 提取趋势数据
    const { pctChanges, dates, indexMap } = extractStreakData(rows, dateField);

    if (pctChanges.length === 0) return undefined;

    // 提取收盘价数据（用于恢复时间计算）
    const closePrices = extractClosePrices(rows);

    // 执行趋势分析（包含恢复时间计算）
    const result = analyzeStreaks(pctChanges, dates, closePrices);

    // 调整索引映射：将 pctChanges 数组的索引映射回原始行的索引
    // 同时重新计算恢复时间（使用调整后的索引）
    const allDates = rows.map((r) => {
      const dateField =
        columns.find((col) =>
          col.toLowerCase().includes('date') || col.toLowerCase().includes('time')
        ) || columns[0];
      return String(r[dateField] || '');
    });

    if (result.maxUp) {
      const originalStartIdx = indexMap[result.maxUp.startIndex] ?? result.maxUp.startIndex;
      const originalEndIdx = indexMap[result.maxUp.endIndex] ?? result.maxUp.endIndex;
      result.maxUp.startIndex = originalStartIdx;
      result.maxUp.endIndex = originalEndIdx;
      
      // 计算价格信息
      const P_start = closePrices[originalStartIdx];
      const P_end = closePrices[originalEndIdx];
      if (!isNaN(P_start) && isFinite(P_start) && !isNaN(P_end) && isFinite(P_end)) {
        result.maxUp.startPrice = P_start;
        result.maxUp.endPrice = P_end;
        result.maxUp.priceChange = P_end - P_start;
        result.maxUp.priceChangePercent = (result.maxUp.priceChange / P_start) * 100;
      }
      
      // 重新计算恢复时间（使用调整后的索引）
      result.recovery.upRecovery = calculateRecoveryDays(
        closePrices,
        result.maxUp,
        allDates
      );
    }
    if (result.maxDown) {
      const originalStartIdx = indexMap[result.maxDown.startIndex] ?? result.maxDown.startIndex;
      const originalEndIdx = indexMap[result.maxDown.endIndex] ?? result.maxDown.endIndex;
      result.maxDown.startIndex = originalStartIdx;
      result.maxDown.endIndex = originalEndIdx;
      
      // 计算价格信息
      const P_start = closePrices[originalStartIdx];
      const P_end = closePrices[originalEndIdx];
      if (!isNaN(P_start) && isFinite(P_start) && !isNaN(P_end) && isFinite(P_end)) {
        result.maxDown.startPrice = P_start;
        result.maxDown.endPrice = P_end;
        result.maxDown.priceChange = P_end - P_start;
        result.maxDown.priceChangePercent = (result.maxDown.priceChange / P_start) * 100;
      }
      
      // 重新计算恢复时间（使用调整后的索引）
      result.recovery.downRecovery = calculateRecoveryDays(
        closePrices,
        result.maxDown,
        allDates
      );
    }

    // 调整所有连续段的索引
    result.streaks = result.streaks.map((streak) => ({
      ...streak,
      startIndex: indexMap[streak.startIndex] ?? streak.startIndex,
      endIndex: indexMap[streak.endIndex] ?? streak.endIndex,
    }));

    // 重新计算所有连续段的首次恢复统计（使用调整后的索引）
    if (closePrices.length > 0 && result.streaks.length > 0) {
      const allFirstRecoveries = calculateAllFirstRecoveries(
        result.streaks,
        closePrices,
        allDates
      );
      result.longestFirstRecovery = findLongestFirstRecovery(allFirstRecoveries);
    }

    return result;
  }, [rows, columns]);

  const handleDataLoaded = (
    rawRows: Array<Record<string, any>>,
    rawColumns: string[]
  ) => {
    setError('');
    
    // 添加派生字段
    const { rows: enhancedRows, columns: enhancedColumns } = addDerivedFields(
      rawRows,
      rawColumns
    );
    
    setRows(enhancedRows);
    setColumns(enhancedColumns);
    
    // 重置图表配置
    setChartConfig({
      chartType: 'line',
      xField: enhancedColumns[0] || '',
      yField: '',
      groupField: undefined,
      xAxisType: undefined, // 默认使用数字模式
    });
    setActiveChartConfig(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setRows([]);
    setColumns([]);
  };

  const handleGenerateChart = () => {
    setActiveChartConfig({ ...chartConfig });
  };

  return (
    <Layout>
      {/* 标题区域 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mini Tableau – Data Visualization Studio
        </h1>
        <p className="text-gray-600">
          轻量级数据可视化平台，支持 CSV 文件上传和多种图表类型
        </p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* 上传区域 */}
      <div className="mb-6">
        <DataUploader onDataLoaded={handleDataLoaded} onError={handleError} />
      </div>

      {/* 趋势连续摘要卡片 */}
      {streakAnalysis && (
        <StreakSummaryCards streakAnalysis={streakAnalysis} />
      )}

      {/* 主要内容区域 */}
      {rows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 左侧：控制面板 */}
          <div className="lg:col-span-1">
            <ControlPanel
              columns={columns}
              rows={rows}
              config={chartConfig}
              onConfigChange={setChartConfig}
              onGenerate={handleGenerateChart}
            />
          </div>

          {/* 右侧：图表区域 */}
          <div className="lg:col-span-2">
            {activeChartConfig ? (
              <ChartRenderer
                rows={rows}
                config={activeChartConfig}
                streakAnalysis={streakAnalysis}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  请配置图表参数并点击「生成图表」按钮
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 统计摘要 */}
      {rows.length > 0 && activeChartConfig && activeChartConfig.yField && (
        <div className="mb-6">
          <SummaryStats
            rows={rows}
            fieldName={activeChartConfig.yField}
          />
        </div>
      )}

      {/* 数据预览 */}
      {rows.length > 0 && (
        <div className="mb-6">
          <DataPreview rows={rows} columns={columns} />
        </div>
      )}
    </Layout>
  );
}

