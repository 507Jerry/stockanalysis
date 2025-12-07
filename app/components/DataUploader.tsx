/**
 * 数据上传组件
 * 负责上传和解析 CSV 文件
 */
'use client';

import React, { useRef } from 'react';
import { parseCsvFile } from '@/app/lib/parseCsv';

interface DataUploaderProps {
  onDataLoaded: (rows: Array<Record<string, any>>, columns: string[]) => void;
  onError: (error: string) => void;
}

export default function DataUploader({
  onDataLoaded,
  onError,
}: DataUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.name.endsWith('.csv')) {
      onError('请上传 CSV 格式的文件');
      return;
    }

    try {
      const result = await parseCsvFile(file);
      if (result.error) {
        onError(result.error);
        return;
      }

      if (result.rows.length === 0) {
        onError('文件为空或无法解析数据');
        return;
      }

      onDataLoaded(result.rows, result.columns);
    } catch (error) {
      onError(`文件处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        上传数据文件
      </h2>
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleButtonClick}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          选择 CSV 文件
        </button>
        <p className="text-sm text-gray-500">
          支持上传 CSV 格式的数据文件
        </p>
      </div>
    </div>
  );
}

