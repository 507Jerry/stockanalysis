/**
 * 图表渲染组件
 * 根据配置渲染不同类型的图表
 */
'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import { ChartConfig } from '@/app/lib/types';
import { StreakAnalysisResult, isInStreak } from '@/app/lib/streakAnalyzer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * 将日期字符串转换为数值（用于排序和显示）
 * 如果无法解析，返回索引
 */
function parseXValue(xRaw: any, index: number, xAxisType?: 'string' | 'number'): { x: number | string; label: string } {
  if (xAxisType === 'string') {
    // 字符串模式：使用索引作为 x 值，原始值作为标签
    return { x: index, label: String(xRaw || '') };
  }
  
  // 数字模式：尝试转换为数值
  const xNum = parseFloat(xRaw);
  if (!isNaN(xNum) && isFinite(xNum)) {
    return { x: xNum, label: String(xRaw) };
  }
  
  return { x: index, label: String(xRaw || '') };
}

interface ChartRendererProps {
  rows: Array<Record<string, any>>;
  config: ChartConfig;
  streakAnalysis?: StreakAnalysisResult; // 可选的趋势分析结果
}

export default function ChartRenderer({
  rows,
  config,
  streakAnalysis,
}: ChartRendererProps) {
  const chartData = useMemo(() => {
    if (!config.yField || rows.length === 0) {
      return null;
    }

    // 直方图特殊处理（支持趋势高亮）
    if (config.chartType === 'histogram') {
      const values = rows
        .map((row, index) => ({
          value: parseFloat(row[config.yField]),
          index,
        }))
        .filter((item) => !isNaN(item.value) && isFinite(item.value));

      if (values.length === 0) return null;

      const min = Math.min(...values.map((v) => v.value));
      const max = Math.max(...values.map((v) => v.value));
      const bins = 20;
      const binWidth = (max - min) / bins;

      const histogram: number[] = new Array(bins).fill(0);
      const upStreakHistogram: number[] = new Array(bins).fill(0);
      const downStreakHistogram: number[] = new Array(bins).fill(0);
      const binLabels: string[] = [];

      for (let i = 0; i < bins; i++) {
        const binStart = min + i * binWidth;
        const binEnd = min + (i + 1) * binWidth;
        binLabels.push(`${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`);
      }

      values.forEach((item) => {
        const binIndex = Math.min(
          Math.floor((item.value - min) / binWidth),
          bins - 1
        );
        histogram[binIndex]++;

        // 检查是否属于最长涨跌段
        if (streakAnalysis && config.yField === 'pct_change') {
          if (
            streakAnalysis.maxUp &&
            isInStreak(item.index, streakAnalysis.maxUp)
          ) {
            upStreakHistogram[binIndex]++;
          }
          if (
            streakAnalysis.maxDown &&
            isInStreak(item.index, streakAnalysis.maxDown)
          ) {
            downStreakHistogram[binIndex]++;
          }
        }
      });

      const datasets: any[] = [
        {
          label: config.yField,
          data: histogram,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ];

      // 如果有趋势分析且是 pct_change 字段，添加高亮数据集
      if (streakAnalysis && config.yField === 'pct_change') {
        if (streakAnalysis.maxUp) {
          datasets.push({
            label: `最长上涨段 (${streakAnalysis.maxUp.days}天, +${streakAnalysis.maxUp.percent.toFixed(2)}%)`,
            data: upStreakHistogram,
            backgroundColor: 'rgba(34, 197, 94, 0.7)', // 深绿色
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 2,
          });
        }
        if (streakAnalysis.maxDown) {
          datasets.push({
            label: `最长下跌段 (${streakAnalysis.maxDown.days}天, ${streakAnalysis.maxDown.percent.toFixed(2)}%)`,
            data: downStreakHistogram,
            backgroundColor: 'rgba(239, 68, 68, 0.7)', // 深红色
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 2,
          });
        }
      }

      return {
        labels: binLabels,
        datasets,
      };
    }

    // 其他图表类型
    if (!config.xField) return null;

    // 如果有分组字段
    if (config.groupField) {
      const groups = new Set(
        rows.map((row) => String(row[config.groupField!] || '未分组'))
      );

      const datasets = Array.from(groups).map((group, idx) => {
        const groupRows = rows.filter(
          (row) => String(row[config.groupField!] || '未分组') === group
        );

        const data = groupRows
          .map((row, globalIndex) => {
            const xRaw = row[config.xField];
            const y = parseFloat(row[config.yField]);
            if (isNaN(y) || !isFinite(y)) return null;
            
            // 根据图表类型和 xAxisType 处理 X 值
            if (config.chartType === 'scatter') {
              // 对于分组情况，需要找到该 xRaw 在所有数据中的位置
              const allXValues = rows.map((r) => String(r[config.xField]));
              const xIndex = allXValues.indexOf(String(xRaw));
              const parsed = parseXValue(xRaw, xIndex >= 0 ? xIndex : globalIndex, config.xAxisType);
              return { x: parsed.x, y, label: parsed.label, originalX: xRaw };
            } else {
              return { x: xRaw, y, originalX: xRaw };
            }
          })
          .filter((point) => point !== null);

        // 生成颜色
        const hue = (idx * 137.508) % 360;
        const color = `hsl(${hue}, 70%, 50%)`;

        return {
          label: group,
          data: config.chartType === 'scatter'
            ? data.map((p: any) => ({ x: p.x, y: p.y }))
            : data.map((p: any) => p.y),
          borderColor: color,
          backgroundColor: config.chartType === 'bar' ? color : 'transparent',
          borderWidth: 2,
        };
      });

      // 对于散点图，直接返回 datasets
      if (config.chartType === 'scatter') {
        return {
          datasets,
        };
      }
      
      // 对于折线图和柱状图，需要 labels
      const allLabels = Array.from(
        new Set(rows.map((row) => String(row[config.xField])))
      );
      
      return {
        labels: allLabels,
        datasets,
      };
    }

    // 无分组
    const data = rows
      .map((row, index) => {
        const xRaw = row[config.xField];
        const y = parseFloat(row[config.yField]);
        if (isNaN(y) || !isFinite(y)) return null;
        
        // 根据图表类型和 xAxisType 处理 X 值
        if (config.chartType === 'scatter') {
          const parsed = parseXValue(xRaw, index, config.xAxisType);
          return { x: parsed.x, y, label: parsed.label, originalX: xRaw, index };
        } else {
          return { x: xRaw, y, originalX: xRaw, index };
        }
      })
      .filter((point) => point !== null);

    // 散点图特殊处理：pct_change 字段的正负值用不同颜色，并标记连续段
    if (config.chartType === 'scatter' && config.yField === 'pct_change') {
      const positiveData = data.filter((point: any) => point.y >= 0);
      const negativeData = data.filter((point: any) => point.y < 0);

      // 对于字符串模式，保留标签信息
      const mapData = (points: any[]) => {
        return points.map((p: any) => ({
          x: p.x,
          y: p.y,
          label: p.label || p.originalX,
          index: p.index,
        }));
      };

      const datasets: any[] = [
        {
          label: '正收益',
          data: mapData(positiveData),
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderColor: 'rgba(239, 68, 68, 1)',
        },
        {
          label: '负收益',
          data: mapData(negativeData),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgba(59, 130, 246, 1)',
        },
      ];

      // 如果有趋势分析，添加最长涨跌段的标记
      if (streakAnalysis) {
        if (streakAnalysis.maxUp) {
          const upStreakData = data
            .map((point: any, idx: number) => ({
              point,
              index: point.index !== undefined ? point.index : idx,
            }))
            .filter((item: any) =>
              streakAnalysis.maxUp
                ? isInStreak(item.index, streakAnalysis.maxUp)
                : false
            )
            .map((item: any) => ({
              x: item.point.x,
              y: item.point.y,
              label: item.point.label || item.point.originalX,
            }));

          if (upStreakData.length > 0) {
            datasets.push({
              label: `最长上涨段 (${streakAnalysis.maxUp.days}天, +${streakAnalysis.maxUp.percent.toFixed(2)}%)`,
              data: upStreakData,
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 3,
              pointRadius: 6,
            });
          }
        }

        if (streakAnalysis.maxDown) {
          const downStreakData = data
            .map((point: any, idx: number) => ({
              point,
              index: point.index !== undefined ? point.index : idx,
            }))
            .filter((item: any) =>
              streakAnalysis.maxDown
                ? isInStreak(item.index, streakAnalysis.maxDown)
                : false
            )
            .map((item: any) => ({
              x: item.point.x,
              y: item.point.y,
              label: item.point.label || item.point.originalX,
            }));

          if (downStreakData.length > 0) {
            datasets.push({
              label: `最长下跌段 (${streakAnalysis.maxDown.days}天, ${streakAnalysis.maxDown.percent.toFixed(2)}%)`,
              data: downStreakData,
              backgroundColor: 'rgba(220, 38, 38, 0.8)',
              borderColor: 'rgba(220, 38, 38, 1)',
              borderWidth: 3,
              pointRadius: 6,
            });
          }
        }
      }

      return {
        datasets,
      };
    }

    // 散点图返回 datasets 格式
    if (config.chartType === 'scatter') {
      return {
        datasets: [
          {
            label: config.yField,
            data: data.map((point: any) => ({
              x: point.x,
              y: point.y,
              label: point.label || point.originalX,
            })),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
          },
        ],
      };
    }

    // 折线图和柱状图返回 labels + data 格式
    return {
      labels: data.map((point: any) => point.originalX || point.x),
      datasets: [
        {
          label: config.yField,
          data: data.map((point: any) => point.y),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor:
            config.chartType === 'bar'
              ? 'rgba(59, 130, 246, 0.5)'
              : 'transparent',
          borderWidth: 2,
        },
      ],
    };
  }, [rows, config]);

  if (!config.yField || rows.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex items-center justify-center">
        <p className="text-gray-500 text-center">
          请先上传数据并配置图表参数
        </p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 flex items-center justify-center">
        <p className="text-gray-500 text-center">
          无法生成图表，请检查数据格式和配置
        </p>
      </div>
    );
  }

  // 准备 X 轴标签映射（用于字符串模式）
  const xAxisLabelMap = useMemo(() => {
    if (config.chartType === 'scatter' && config.xAxisType === 'string' && rows.length > 0 && config.xField) {
      const labelMap = new Map<number, string>();
      // 从原始数据中构建标签映射，确保所有唯一的 X 值都有对应的标签
      const uniqueXValues = Array.from(new Set(rows.map((row) => String(row[config.xField]))));
      uniqueXValues.forEach((xValue, index) => {
        labelMap.set(index, xValue);
      });
      return labelMap;
    }
    return null;
  }, [config, rows]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${config.chartType.toUpperCase()} Chart: ${config.yField} vs ${config.xField || 'Frequency'}`,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (config.chartType === 'scatter' && config.xAxisType === 'string') {
              // 对于字符串模式的散点图，在 tooltip 中显示原始标签
              const point = context.raw;
              if (point && point.label) {
                return `${config.yField}: ${context.parsed.y?.toFixed(4) || context.parsed.y}, ${config.xField}: ${point.label}`;
              }
            }
            return `${config.yField}: ${context.parsed.y?.toFixed(4) || context.parsed.y}`;
          },
        },
      },
    },
    scales:
      config.chartType === 'scatter'
        ? {
            x: {
              type: 'linear' as const,
              position: 'bottom' as const,
              ...(config.xAxisType === 'string' && xAxisLabelMap
                ? {
                    ticks: {
                      callback: function (value: any) {
                        // 显示对应的字符串标签
                        const numValue = Number(value);
                        const label = xAxisLabelMap?.get(Math.round(numValue));
                        return label !== undefined ? label : value;
                      },
                      maxRotation: 45,
                      minRotation: 45,
                      maxTicksLimit: 20, // 限制显示的标签数量，避免过于拥挤
                    },
                  }
                : {}),
            },
            y: {
              type: 'linear' as const,
            },
          }
        : undefined,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="h-96">
        {config.chartType === 'line' && (
          <Line data={chartData} options={chartOptions} />
        )}
        {config.chartType === 'bar' && (
          <Bar data={chartData} options={chartOptions} />
        )}
        {config.chartType === 'scatter' && (
          <Scatter data={chartData} options={chartOptions} />
        )}
        {config.chartType === 'histogram' && (
          <Bar data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

