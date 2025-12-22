import { Matrix, AnimationStep, CellState, Language } from '../types';
import { cloneMatrix } from '../utils/validation';

// 翻转方法的代码行映射
const codeLineMapping: Record<Language, Record<string, number[]>> = {
  java: {
    init: [2, 3],
    hFlipComment: [4],
    hFlipOuter: [5],
    hFlipInner: [6],
    hFlipSwap: [7, 8, 9],
    dFlipComment: [12],
    dFlipOuter: [13],
    dFlipInner: [14],
    dFlipSwap: [15, 16, 17],
    done: [20],
  },
  python: {
    init: [2],
    hFlipComment: [3],
    hFlipOuter: [4],
    hFlipInner: [5],
    hFlipSwap: [6, 7],
    dFlipComment: [8],
    dFlipOuter: [9],
    dFlipInner: [10],
    dFlipSwap: [11, 12],
    done: [12],
  },
  golang: {
    init: [2],
    hFlipComment: [3],
    hFlipOuter: [4],
    hFlipInner: [5],
    hFlipSwap: [6, 7],
    dFlipComment: [10],
    dFlipOuter: [11],
    dFlipInner: [12],
    dFlipSwap: [13, 14],
    done: [16],
  },
  javascript: {
    init: [2],
    hFlipComment: [3],
    hFlipOuter: [4],
    hFlipInner: [5],
    hFlipSwap: [6, 7],
    dFlipComment: [10],
    dFlipOuter: [11],
    dFlipInner: [12],
    dFlipSwap: [13, 14],
    done: [16],
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

export function generateFlipSteps(inputMatrix: Matrix): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const n = inputMatrix.length;
  const matrix = cloneMatrix(inputMatrix);
  let stepId = 0;

  // 步骤1: 初始化
  steps.push({
    id: stepId++,
    description: `初始化：获取矩阵大小 n = ${n}，将进行两次翻转操作`,
    matrix: cloneMatrix(matrix),
    highlightCells: [],
    codeLineMap: getCodeLines('init'),
    variables: { n },
  });

  // 步骤2: 开始水平翻转
  steps.push({
    id: stepId++,
    description: '第一步：水平翻转（上下翻转）',
    matrix: cloneMatrix(matrix),
    highlightCells: [],
    codeLineMap: getCodeLines('hFlipComment'),
    variables: { n, '操作': '水平翻转' },
    annotations: [{ row: 0, col: Math.floor(n/2), text: '↕ 水平翻转', position: 'top' }],
  });

  // 水平翻转
  for (let i = 0; i < Math.floor(n / 2); i++) {
    for (let j = 0; j < n; j++) {
      const row1 = i;
      const row2 = n - i - 1;
      
      // 显示要交换的两个位置
      steps.push({
        id: stepId++,
        description: `水平翻转：交换 [${row1}][${j}] 和 [${row2}][${j}]`,
        matrix: cloneMatrix(matrix),
        highlightCells: [
          { row: row1, col: j, value: matrix[row1][j], highlight: 'source', label: '上' },
          { row: row2, col: j, value: matrix[row2][j], highlight: 'target', label: '下' },
        ],
        codeLineMap: getCodeLines('hFlipInner'),
        variables: { n, i, j, 'matrix[i][j]': matrix[row1][j], 'matrix[n-i-1][j]': matrix[row2][j] },
        arrows: [
          { fromRow: row1, fromCol: j, toRow: row2, toCol: j, label: `${matrix[row1][j]}`, color: '#1890ff' },
          { fromRow: row2, fromCol: j, toRow: row1, toCol: j, label: `${matrix[row2][j]}`, color: '#52c41a' },
        ],
      });

      // 执行交换
      const temp = matrix[row1][j];
      matrix[row1][j] = matrix[row2][j];
      matrix[row2][j] = temp;

      steps.push({
        id: stepId++,
        description: `交换完成：[${row1}][${j}] = ${matrix[row1][j]}, [${row2}][${j}] = ${matrix[row2][j]}`,
        matrix: cloneMatrix(matrix),
        highlightCells: [
          { row: row1, col: j, value: matrix[row1][j], highlight: 'completed' },
          { row: row2, col: j, value: matrix[row2][j], highlight: 'completed' },
        ],
        codeLineMap: getCodeLines('hFlipSwap'),
        variables: { n, i, j, 'matrix[i][j]': matrix[row1][j], 'matrix[n-i-1][j]': matrix[row2][j] },
      });
    }
  }

  // 水平翻转完成
  const hFlipComplete: CellState[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      hFlipComplete.push({ row: i, col: j, value: matrix[i][j], highlight: 'completed' });
    }
  }
  steps.push({
    id: stepId++,
    description: '水平翻转完成',
    matrix: cloneMatrix(matrix),
    highlightCells: hFlipComplete,
    codeLineMap: getCodeLines('hFlipOuter'),
    variables: { n, '水平翻转': '完成' },
  });

  // 步骤: 开始主对角线翻转
  steps.push({
    id: stepId++,
    description: '第二步：主对角线翻转（沿左上到右下对角线）',
    matrix: cloneMatrix(matrix),
    highlightCells: [],
    codeLineMap: getCodeLines('dFlipComment'),
    variables: { n, '操作': '主对角线翻转' },
    annotations: [{ row: 0, col: 0, text: '↘ 主对角线翻转', position: 'top' }],
  });

  // 主对角线翻转
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      // 显示要交换的两个位置
      steps.push({
        id: stepId++,
        description: `主对角线翻转：交换 [${i}][${j}] 和 [${j}][${i}]`,
        matrix: cloneMatrix(matrix),
        highlightCells: [
          { row: i, col: j, value: matrix[i][j], highlight: 'source', label: '下三角' },
          { row: j, col: i, value: matrix[j][i], highlight: 'target', label: '上三角' },
        ],
        codeLineMap: getCodeLines('dFlipInner'),
        variables: { n, i, j, 'matrix[i][j]': matrix[i][j], 'matrix[j][i]': matrix[j][i] },
        arrows: [
          { fromRow: i, fromCol: j, toRow: j, toCol: i, label: `${matrix[i][j]}`, color: '#faad14' },
          { fromRow: j, fromCol: i, toRow: i, toCol: j, label: `${matrix[j][i]}`, color: '#ff4d4f' },
        ],
      });

      // 执行交换
      const temp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = temp;

      steps.push({
        id: stepId++,
        description: `交换完成：[${i}][${j}] = ${matrix[i][j]}, [${j}][${i}] = ${matrix[j][i]}`,
        matrix: cloneMatrix(matrix),
        highlightCells: [
          { row: i, col: j, value: matrix[i][j], highlight: 'completed' },
          { row: j, col: i, value: matrix[j][i], highlight: 'completed' },
        ],
        codeLineMap: getCodeLines('dFlipSwap'),
        variables: { n, i, j, 'matrix[i][j]': matrix[i][j], 'matrix[j][i]': matrix[j][i] },
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
    description: '翻转方法完成！通过水平翻转+主对角线翻转实现顺时针旋转90度',
    matrix: cloneMatrix(matrix),
    highlightCells: completedCells,
    codeLineMap: getCodeLines('done'),
    variables: { n, '状态': '完成' },
  });

  return steps;
}
