import Papa from 'papaparse';

/**
 * CSV 解析结果类型
 */
export interface ParseResult {
  rows: Array<Record<string, any>>;
  columns: string[];
  error?: string;
}

/**
 * 解析 CSV 文件
 * @param file - 要解析的 CSV 文件
 * @returns Promise<ParseResult> - 解析结果，包含行数据和列名
 */
export async function parseCsvFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          resolve({
            rows: [],
            columns: [],
            error: `解析错误: ${results.errors[0].message}`,
          });
          return;
        }

        const rows = results.data as Array<Record<string, any>>;
        const columns = results.meta.fields || [];

        resolve({
          rows,
          columns,
        });
      },
      error: (error) => {
        resolve({
          rows: [],
          columns: [],
          error: `文件读取错误: ${error.message}`,
        });
      },
    });
  });
}

