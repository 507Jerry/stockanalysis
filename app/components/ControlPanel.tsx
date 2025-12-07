/**
 * 图表配置控制面板
 * 用于选择图表类型、X轴、Y轴和分组字段
 */
'use client';

import React from 'react';
import { ChartConfig, ChartType } from '@/app/lib/types';
import { getNumericFields } from '@/app/lib/transform';

interface ControlPanelProps {
  columns: string[];
  rows: Array<Record<string, any>>;
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
  onGenerate: () => void;
}

export default function ControlPanel({
  columns,
  rows,
  config,
  onConfigChange,
  onGenerate,
}: ControlPanelProps) {
  const numericFields = getNumericFields(rows, columns);

  const handleFieldChange = (field: keyof ChartConfig, value: string) => {
    onConfigChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        图表配置
      </h2>

      {/* 图表类型 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          图表类型
        </label>
        <select
          value={config.chartType}
          onChange={(e) =>
            handleFieldChange('chartType', e.target.value as ChartType)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="line">折线图 (Line)</option>
          <option value="bar">柱状图 (Bar)</option>
          <option value="scatter">散点图 (Scatter)</option>
          <option value="histogram">直方图 (Histogram)</option>
        </select>
      </div>

      {/* X 轴字段 */}
      {config.chartType !== 'histogram' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X 轴字段
            </label>
            <select
              value={config.xField}
              onChange={(e) => handleFieldChange('xField', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择...</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>
          
          {/* X 轴数据类型（仅散点图显示） */}
          {config.chartType === 'scatter' && config.xField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                X 轴数据类型
              </label>
              <select
                value={config.xAxisType || 'number'}
                onChange={(e) =>
                  onConfigChange({
                    ...config,
                    xAxisType: e.target.value as 'string' | 'number',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="string">字符串 (String) - 显示原始日期/文本</option>
                <option value="number">数字 (Number) - 转换为数值</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                选择"字符串"可查看原始日期分布，便于数据清洗
              </p>
            </div>
          )}
        </>
      )}

      {/* Y 轴字段 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Y 轴字段
        </label>
        <select
          value={config.yField}
          onChange={(e) => handleFieldChange('yField', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">请选择...</option>
          {numericFields.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      {/* 分组字段（可选） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          分组字段（可选）
        </label>
        <select
          value={config.groupField || ''}
          onChange={(e) =>
            handleFieldChange('groupField', e.target.value || undefined)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">无分组</option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>

      {/* 生成图表按钮 */}
      <button
        onClick={onGenerate}
        disabled={!config.yField || (config.chartType !== 'histogram' && !config.xField)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        生成图表
      </button>
    </div>
  );
}

