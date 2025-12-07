/**
 * 数据预览组件
 * 显示数据表格，支持排序功能
 */
'use client';

import React, { useState, useMemo } from 'react';

interface DataPreviewProps {
  rows: Array<Record<string, any>>;
  columns: string[];
}

type SortConfig = {
  field: string;
  direction: 'asc' | 'desc';
} | null;

export default function DataPreview({ rows, columns }: DataPreviewProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);

  // 限制显示前 50 行
  const displayRows = useMemo(() => {
    let sorted = [...rows];
    
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.field];
        const bVal = b[sortConfig.field];
        
        // 尝试数值比较
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc'
            ? aNum - bNum
            : bNum - aNum;
        }
        
        // 字符串比较
        const aStr = String(aVal || '').toLowerCase();
        const bStr = String(bVal || '').toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }
    
    return sorted.slice(0, 50);
  }, [rows, sortConfig]);

  const handleSort = (field: string) => {
    if (sortConfig?.field === field) {
      // 切换排序方向
      setSortConfig({
        field,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      // 新字段，默认升序
      setSortConfig({ field, direction: 'asc' });
    }
  };

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) {
      return (
        <span className="text-gray-400 text-xs ml-1">↕</span>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <span className="text-blue-600 text-xs ml-1">↑</span>
    ) : (
      <span className="text-blue-600 text-xs ml-1">↓</span>
    );
  };

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center">暂无数据，请先上传 CSV 文件</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        数据预览（前 50 行，共 {rows.length} 行）
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  onMouseEnter={() => setHoveredColumn(col)}
                  onMouseLeave={() => setHoveredColumn(null)}
                  className={`px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer select-none ${
                    hoveredColumn === col ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center">
                    {col}
                    {getSortIcon(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 text-gray-600">
                    {row[col] !== null && row[col] !== undefined
                      ? String(row[col])
                      : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

