/**
 * 统计摘要组件
 * 显示当前选择字段的统计指标
 */
'use client';

import React from 'react';
import { calculateSummaryStats, SummaryStats as SummaryStatsType } from '@/app/lib/transform';

interface SummaryStatsProps {
  rows: Array<Record<string, any>>;
  fieldName: string;
}

export default function SummaryStats({
  rows,
  fieldName,
}: SummaryStatsProps) {
  const stats = React.useMemo(() => {
    if (!fieldName || rows.length === 0) {
      return null;
    }
    return calculateSummaryStats(rows, fieldName);
  }, [rows, fieldName]);

  if (!fieldName) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          统计摘要
        </h2>
        <p className="text-gray-500 text-center">请先选择 Y 轴字段</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          统计摘要 - {fieldName}
        </h2>
        <p className="text-gray-500 text-center">无法计算统计信息</p>
      </div>
    );
  }

  const statItems = [
    { label: '样本数 (Count)', value: stats.count },
    { label: '均值 (Mean)', value: stats.mean },
    { label: '标准差 (Std)', value: stats.std },
    { label: '最小值 (Min)', value: stats.min },
    { label: '25% 分位数 (Q25)', value: stats.q25 },
    { label: '中位数 (Median)', value: stats.median },
    { label: '75% 分位数 (Q75)', value: stats.q75 },
    { label: '最大值 (Max)', value: stats.max },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        统计摘要 - {fieldName}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item) => (
          <div key={item.label} className="border border-gray-200 rounded p-3">
            <div className="text-xs text-gray-500 mb-1">{item.label}</div>
            <div className="text-lg font-semibold text-gray-800">
              {typeof item.value === 'number'
                ? item.value.toLocaleString('zh-CN', {
                    maximumFractionDigits: 4,
                  })
                : item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

