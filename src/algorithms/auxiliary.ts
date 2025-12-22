import { Matrix, AnimationStep, CellState, Language } from '../types';
import { cloneMatrix } from '../utils/validation';

// 辅助数组方法的代码行映射
const codeLineMapping: Record<Language, Record<string, number[]>> = {
  java: {
    init: [2, 3],
    createAux: [4],
    outerLoop: [5],
    innerLoop: [6],
    copy: [7],
    copyBackOuter: [10],
    copyBackInner: [11],
    copyBackAssign: [12],
    done: [15],
  },
  python: {
    init: [2],
    createAux: [3],
    outerLoop: [4],
    innerLoop: [5],
    copy: [6],
    copyBackOuter: [7],
    copyBackInner: [8],
    copyBackAssign: [9],
    done: [9],
  },
  golang: {
    init: [2],
    createAux: [3, 4, 5],
    outerLoop: [6],
    innerLoop: [7],
    copy: [8],
    copyBackOuter: [11],
    copyBackInner: [12],
    copyBackAssign: [13],
    done: [16],
  },
  javascript: {
    init: [2],
    createAux: [3],
    outerLoop: [4],
    innerLoop: [5],
    copy: [6],
    copyBackOuter: [9],
    copyBackInner: [10],
    copyBackAssign: [11],
    done: [13],
  },
};

function getCodeLines(step: string): Record<Language, number[]> {
  return {
    java: codeLineMapping.java[step] || [],
    python: codeLineMapping.python[step] || [],
    golang: codeLineMapping.golang[step] || [],
    javascript: codeLineMapping.javascript[step] || [],
  };
}

export function generateAuxiliarySteps(inputMatrix: Matrix): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const n = inputMatrix.length;
  const matrix = cloneMatrix(inputMatrix);
  const auxiliaryMatrix: Matrix = Array.from({ length: n }, () => Array(n).fill(0));
  let stepId = 0;

  // 步骤1: 初始化
  steps.push({
    id: stepId++,
    description: `初始化：获取矩阵大小 n = ${n}`,
    matrix: cloneMatrix(matrix),
    auxiliaryMatrix: cloneMatrix(auxiliaryMatrix),
    highlightCells: [],
    codeLineMap: getCodeLines('init'),
    variables: { n },
  });

  // 步骤2: 创建辅助数组
  steps.push({
    id: stepId++,
    description: '创建 n×n 的辅助数组 matrixNew',
    matrix: cloneMatrix(matrix),
    auxiliaryMatrix: cloneMatrix(auxiliaryMatrix),
    highlightCells: [],
    codeLineMap: getCodeLines('createAux'),
    variables: { n },
    annotations: [{ row: 0, col: 0, text: '辅助数组', position: 'top', isAuxiliary: true }],
  });

  // 步骤3-N: 遍历并复制到辅助数组
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const newRow = j;
      const newCol = n - i - 1;
      
      // 显示当前遍历位置
      const highlightCells: CellState[] = [
        { row: i, col: j, value: matrix[i][j], highlight: 'source', label: `[${i}][${j}]` },
      ];

      steps.push({
        id: stepId++,
        description: `遍历原矩阵位置 [${i}][${j}]，值为 ${matrix[i][j]}`,
        matrix: cloneMatrix(matrix),
        auxiliaryMatrix: cloneMatrix(auxiliaryMatrix),
        highlightCells,
        codeLineMap: getCodeLines('innerLoop'),
        variables: { n, i, j, 'matrix[i][j]': matrix[i][j] },
      });

      // 复制到辅助数组
      auxiliaryMatrix[newRow][newCol] = matrix[i][j];
      
      const copyHighlight: CellState[] = [
        { row: i, col: j, value: matrix[i][j], highlight: 'source', label: '源' },
        { row: newRow, col: newCol, value: auxiliaryMatrix[newRow][newCol], highlight: 'target', label: '目标' },
      ];

      steps.push({
        id: stepId++,
        description: `将 matrix[${i}][${j}] = ${matrix[i][j]} 复制到 matrixNew[${newRow}][${newCol}]`,
        matrix: cloneMatrix(matrix),
        auxiliaryMatrix: cloneMatrix(auxiliaryMatrix),
        highlightCells: copyHighlight,
        codeLineMap: getCodeLines('copy'),
        variables: { 
          n, i, j, 
          'matrix[i][j]': matrix[i][j],
          'newRow (j)': newRow,
          'newCol (n-i-1)': newCol,
        },
        arrows: [{
          fromRow: i,
          fromCol: j,
          toRow: newRow,
          toCol: newCol,
          label: `${matrix[i][j]}`,
          color: '#1890ff',
          isAuxiliary: true,
        }],
      });
    }
  }

  // 步骤: 开始复制回原数组
  steps.push({
    id: stepId++,
    description: '开始将辅助数组的值复制回原矩阵',
    matrix: cloneMatrix(matrix),
    auxiliaryMatrix: cloneMatrix(auxiliaryMatrix),
    highlightCells: [],
    codeLineMap: getCodeLines('copyBackOuter'),
    variables: { n },
  });

  // 复制回原数组
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      matrix[i][j] = auxiliaryMatrix[i][j];
      
      const copyBackHighlight: CellState[] = [
        { row: i, col: j, value: auxiliaryMatrix[i][j], highlight: 'source', label: '源' },
        { row: i, col: j, value: matrix[i][j], highlight: 'completed', label: '已复制' },
      ];

      steps.push({
        id: stepId++,
        description: `将 matrixNew[${i}][${j}] = ${auxiliaryMatrix[i][j]} 复制回 matrix[${i}][${j}]`,
        matrix: cloneMatrix(matrix),
        auxiliaryMatrix: cloneMatrix(auxiliaryMatrix),
        highlightCells: copyBackHighlight,
        codeLineMap: getCodeLines('copyBackAssign'),
        variables: { n, i, j, 'matrixNew[i][j]': auxiliaryMatrix[i][j] },
        arrows: [{
          fromRow: i,
          fromCol: j,
          toRow: i,
          toCol: j,
          label: `${auxiliaryMatrix[i][j]}`,
          color: '#52c41a',
          isAuxiliary: false,
        }],
      });
    }
  }

  // 完成
  const completedCells: CellState[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      completedCells.push({ row: i, col: j, value: matrix[i][j], highlight: 'completed' });
    }
  }

  steps.push({
    id: stepId++,
    description: '旋转完成！矩阵已顺时针旋转90度',
    matrix: cloneMatrix(matrix),
    auxiliaryMatrix: cloneMatrix(auxiliaryMatrix),
    highlightCells: completedCells,
    codeLineMap: getCodeLines('done'),
    variables: { n, '状态': '完成' },
  });

  return steps;
}
