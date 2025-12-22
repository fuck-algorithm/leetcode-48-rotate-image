// 矩阵类型
export type Matrix = number[][];

// 编程语言类型
export type Language = 'java' | 'python' | 'golang' | 'javascript';

// 算法类型
export type AlgorithmType = 'auxiliary' | 'inplace' | 'flip';

// 单元格状态
export interface CellState {
  row: number;
  col: number;
  value: number;
  highlight?: 'source' | 'target' | 'temp' | 'swapping' | 'completed';
  label?: string;
}

// 动画步骤
export interface AnimationStep {
  id: number;
  description: string;
  matrix: Matrix;
  auxiliaryMatrix?: Matrix;
  highlightCells: CellState[];
  codeLineMap: Record<Language, number[]>;
  variables: Record<string, string | number>;
  arrows?: Arrow[];
  annotations?: Annotation[];
}

// 箭头
export interface Arrow {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  label?: string;
  color?: string;
  isAuxiliary?: boolean;
}

// 标注
export interface Annotation {
  row: number;
  col: number;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  isAuxiliary?: boolean;
}

// 播放状态
export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
}

// 算法信息
export interface AlgorithmInfo {
  type: AlgorithmType;
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  steps: AnimationStep[];
}

// 代码信息
export interface CodeInfo {
  language: Language;
  code: string;
  lineCount: number;
}

// 示例数据
export interface ExampleData {
  name: string;
  matrix: Matrix;
}
