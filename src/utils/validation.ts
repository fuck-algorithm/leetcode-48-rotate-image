import { Matrix } from '../types';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  matrix?: Matrix;
}

// 解析矩阵输入
export function parseMatrixInput(input: string): ValidationResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { valid: false, error: '请输入矩阵数据' };
  }

  try {
    // 尝试解析 JSON 格式
    const parsed = JSON.parse(trimmed);
    
    if (!Array.isArray(parsed)) {
      return { valid: false, error: '输入必须是二维数组' };
    }
    
    return validateMatrix(parsed);
  } catch {
    // 尝试解析简化格式，如 "1,2,3;4,5,6;7,8,9"
    try {
      const rows = trimmed.split(';').map(row => 
        row.split(',').map(num => {
          const n = parseInt(num.trim(), 10);
          if (isNaN(n)) throw new Error('Invalid number');
          return n;
        })
      );
      return validateMatrix(rows);
    } catch {
      return { valid: false, error: '无法解析输入，请使用正确的格式' };
    }
  }
}

// 验证矩阵
export function validateMatrix(matrix: unknown): ValidationResult {
  if (!Array.isArray(matrix)) {
    return { valid: false, error: '输入必须是数组' };
  }

  const n = matrix.length;
  
  if (n === 0) {
    return { valid: false, error: '矩阵不能为空' };
  }
  
  if (n < 1 || n > 20) {
    return { valid: false, error: '矩阵大小必须在 1 到 20 之间' };
  }

  for (let i = 0; i < n; i++) {
    const row = matrix[i];
    
    if (!Array.isArray(row)) {
      return { valid: false, error: `第 ${i + 1} 行不是数组` };
    }
    
    if (row.length !== n) {
      return { valid: false, error: '矩阵必须是 n×n 的方阵' };
    }
    
    for (let j = 0; j < n; j++) {
      const val = row[j];
      
      if (typeof val !== 'number' || !Number.isInteger(val)) {
        return { valid: false, error: `位置 [${i}][${j}] 的值必须是整数` };
      }
      
      if (val < -1000 || val > 1000) {
        return { valid: false, error: `位置 [${i}][${j}] 的值必须在 -1000 到 1000 之间` };
      }
    }
  }

  return { valid: true, matrix: matrix as Matrix };
}

// 生成随机矩阵
export function generateRandomMatrix(size?: number): Matrix {
  const n = size ?? Math.floor(Math.random() * 5) + 2; // 2-6
  const matrix: Matrix = [];
  
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      // 生成 -100 到 100 之间的随机整数
      row.push(Math.floor(Math.random() * 201) - 100);
    }
    matrix.push(row);
  }
  
  return matrix;
}

// 深拷贝矩阵
export function cloneMatrix(matrix: Matrix): Matrix {
  return matrix.map(row => [...row]);
}

// 矩阵转字符串（用于显示）
export function matrixToString(matrix: Matrix): string {
  return JSON.stringify(matrix);
}
