import { Matrix, AnimationStep, CellState, Language } from '../types';
import { cloneMatrix } from '../utils/validation';

// 原地旋转方法的代码行映射
const codeLineMapping: Record<Language, Record<string, number[]>> = {
  java: {
    init: [2, 3],
    outerLoop: [4],
    innerLoop: [5],
    saveTemp: [6],
    rotate1: [7],
    rotate2: [8],
    rotate3: [9],
    rotate4: [10],
    done: [13],
  },
  python: {
    init: [2],
    outerLoop: [3],
    innerLoop: [4],
    saveTemp: [5],
    rotate1: [6],
    rotate2: [7],
    rotate3: [8],
    rotate4: [9],
    done: [9],
  },
  golang: {
    init: [2],
    outerLoop: [3],
    innerLoop: [4],
    saveTemp: [5],
    rotate1: [6],
    rotate2: [7],
    rotate3: [8],
    rotate4: [9],
    done: [11],
  },
  javascript: {
    init: [2],
    outerLoop: [3],
    innerLoop: [4],
    saveTemp: [5],
    rotate1: [6],
    rotate2: [7],
    rotate3: [8],
    rotate4: [9],
    done: [11],
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

export function generateInplaceSteps(inputMatrix: Matrix): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const n = inputMatrix.length;
  const matrix = cloneMatrix(inputMatrix);
  let stepId = 0;

  // 步骤1: 初始化
  steps.push({
    id: stepId++,
    description: `初始化：获取矩阵大小 n = ${n}，将遍历 ${Math.floor(n/2)} × ${Math.floor((n+1)/2)} 个位置`,
    matrix: cloneMatrix(matrix),
    highlightCells: [],
    codeLineMap: getCodeLines('init'),
    variables: { n, 'n/2': Math.floor(n/2), '(n+1)/2': Math.floor((n+1)/2) },
  });

  // 遍历需要旋转的位置
  for (let i = 0; i < Math.floor(n / 2); i++) {
    for (let j = 0; j < Math.floor((n + 1) / 2); j++) {
      // 计算四个位置
      const pos1 = { row: i, col: j };
      const pos2 = { row: n - j - 1, col: i };
      const pos3 = { row: n - i - 1, col: n - j - 1 };
      const pos4 = { row: j, col: n - i - 1 };

      // 显示当前要旋转的四个位置
      const fourCells: CellState[] = [
        { row: pos1.row, col: pos1.col, value: matrix[pos1.row][pos1.col], highlight: 'source', label: '①' },
        { row: pos2.row, col: pos2.col, value: matrix[pos2.row][pos2.col], highlight: 'target', label: '②' },
        { row: pos3.row, col: pos3.col, value: matrix[pos3.row][pos3.col], highlight: 'temp', label: '③' },
        { row: pos4.row, col: pos4.col, value: matrix[pos4.row][pos4.col], highlight: 'swapping', label: '④' },
      ];

      steps.push({
        id: stepId++,
        description: `选择四个循环位置：[${pos1.row}][${pos1.col}] → [${pos4.row}][${pos4.col}] → [${pos3.row}][${pos3.col}] → [${pos2.row}][${pos2.col}]`,
        matrix: cloneMatrix(matrix),
        highlightCells: fourCells,
        codeLineMap: getCodeLines('innerLoop'),
        variables: { n, i, j },
        arrows: [
          { fromRow: pos1.row, fromCol: pos1.col, toRow: pos4.row, toCol: pos4.col, label: '', color: '#1890ff' },
          { fromRow: pos4.row, fromCol: pos4.col, toRow: pos3.row, toCol: pos3.col, label: '', color: '#52c41a' },
          { fromRow: pos3.row, fromCol: pos3.col, toRow: pos2.row, toCol: pos2.col, label: '', color: '#faad14' },
          { fromRow: pos2.row, fromCol: pos2.col, toRow: pos1.row, toCol: pos1.col, label: '', color: '#ff4d4f' },
        ],
      });

      // 保存 temp
      const temp = matrix[pos1.row][pos1.col];
      steps.push({
        id: stepId++,
        description: `保存 temp = matrix[${pos1.row}][${pos1.col}] = ${temp}`,
        matrix: cloneMatrix(matrix),
        highlightCells: [{ row: pos1.row, col: pos1.col, value: temp, highlight: 'source', label: 'temp' }],
        codeLineMap: getCodeLines('saveTemp'),
        variables: { n, i, j, temp },
      });

      // 第一次赋值: matrix[i][j] = matrix[n-j-1][i]
      matrix[pos1.row][pos1.col] = matrix[pos2.row][pos2.col];
      steps.push({
        id: stepId++,
        description: `matrix[${pos1.row}][${pos1.col}] = matrix[${pos2.row}][${pos2.col}] = ${matrix[pos1.row][pos1.col]}`,
        matrix: cloneMatrix(matrix),
        highlightCells: [
          { row: pos2.row, col: pos2.col, value: matrix[pos2.row][pos2.col], highlight: 'source', label: '源' },
          { row: pos1.row, col: pos1.col, value: matrix[pos1.row][pos1.col], highlight: 'target', label: '目标' },
        ],
        codeLineMap: getCodeLines('rotate1'),
        variables: { n, i, j, temp, 'matrix[i][j]': matrix[pos1.row][pos1.col] },
        arrows: [{ fromRow: pos2.row, fromCol: pos2.col, toRow: pos1.row, toCol: pos1.col, label: `${matrix[pos1.row][pos1.col]}`, color: '#1890ff' }],
      });

      // 第二次赋值: matrix[n-j-1][i] = matrix[n-i-1][n-j-1]
      matrix[pos2.row][pos2.col] = matrix[pos3.row][pos3.col];
      steps.push({
        id: stepId++,
        description: `matrix[${pos2.row}][${pos2.col}] = matrix[${pos3.row}][${pos3.col}] = ${matrix[pos2.row][pos2.col]}`,
        matrix: cloneMatrix(matrix),
        highlightCells: [
          { row: pos3.row, col: pos3.col, value: matrix[pos3.row][pos3.col], highlight: 'source', label: '源' },
          { row: pos2.row, col: pos2.col, value: matrix[pos2.row][pos2.col], highlight: 'target', label: '目标' },
        ],
        codeLineMap: getCodeLines('rotate2'),
        variables: { n, i, j, temp, 'matrix[n-j-1][i]': matrix[pos2.row][pos2.col] },
        arrows: [{ fromRow: pos3.row, fromCol: pos3.col, toRow: pos2.row, toCol: pos2.col, label: `${matrix[pos2.row][pos2.col]}`, color: '#52c41a' }],
      });

      // 第三次赋值: matrix[n-i-1][n-j-1] = matrix[j][n-i-1]
      matrix[pos3.row][pos3.col] = matrix[pos4.row][pos4.col];
      steps.push({
        id: stepId++,
        description: `matrix[${pos3.row}][${pos3.col}] = matrix[${pos4.row}][${pos4.col}] = ${matrix[pos3.row][pos3.col]}`,
        matrix: cloneMatrix(matrix),
        highlightCells: [
          { row: pos4.row, col: pos4.col, value: matrix[pos4.row][pos4.col], highlight: 'source', label: '源' },
          { row: pos3.row, col: pos3.col, value: matrix[pos3.row][pos3.col], highlight: 'target', label: '目标' },
        ],
        codeLineMap: getCodeLines('rotate3'),
        variables: { n, i, j, temp, 'matrix[n-i-1][n-j-1]': matrix[pos3.row][pos3.col] },
        arrows: [{ fromRow: pos4.row, fromCol: pos4.col, toRow: pos3.row, toCol: pos3.col, label: `${matrix[pos3.row][pos3.col]}`, color: '#faad14' }],
      });

      // 第四次赋值: matrix[j][n-i-1] = temp
      matrix[pos4.row][pos4.col] = temp;
      steps.push({
        id: stepId++,
        description: `matrix[${pos4.row}][${pos4.col}] = temp = ${temp}`,
        matrix: cloneMatrix(matrix),
        highlightCells: [
          { row: pos4.row, col: pos4.col, value: matrix[pos4.row][pos4.col], highlight: 'completed', label: 'temp' },
        ],
        codeLineMap: getCodeLines('rotate4'),
        variables: { n, i, j, temp, 'matrix[j][n-i-1]': matrix[pos4.row][pos4.col] },
        annotations: [{ row: pos4.row, col: pos4.col, text: `← temp(${temp})`, position: 'right' }],
      });

      // 显示这一轮旋转完成
      steps.push({
        id: stepId++,
        description: `完成一组四元素旋转`,
        matrix: cloneMatrix(matrix),
        highlightCells: [
          { row: pos1.row, col: pos1.col, value: matrix[pos1.row][pos1.col], highlight: 'completed' },
          { row: pos2.row, col: pos2.col, value: matrix[pos2.row][pos2.col], highlight: 'completed' },
          { row: pos3.row, col: pos3.col, value: matrix[pos3.row][pos3.col], highlight: 'completed' },
          { row: pos4.row, col: pos4.col, value: matrix[pos4.row][pos4.col], highlight: 'completed' },
        ],
        codeLineMap: getCodeLines('innerLoop'),
        variables: { n, i, j, '状态': '一组完成' },
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
    description: '原地旋转完成！矩阵已顺时针旋转90度，空间复杂度 O(1)',
    matrix: cloneMatrix(matrix),
    highlightCells: completedCells,
    codeLineMap: getCodeLines('done'),
    variables: { n, '状态': '完成' },
  });

  return steps;
}
