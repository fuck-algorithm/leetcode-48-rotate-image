import { Matrix, AlgorithmType, AlgorithmInfo } from '../types';
import { generateAuxiliarySteps } from './auxiliary';
import { generateInplaceSteps } from './inplace';
import { generateFlipSteps } from './flip';

export { getCode, getAllCodes } from './codes';

// 算法描述信息
const algorithmDescriptions: Record<AlgorithmType, Omit<AlgorithmInfo, 'steps'>> = {
  auxiliary: {
    type: 'auxiliary',
    name: '辅助数组法',
    description: '使用一个与原矩阵大小相同的辅助数组，将原矩阵的元素按照旋转规则复制到辅助数组中，最后再复制回原矩阵。',
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(N²)',
  },
  inplace: {
    type: 'inplace',
    name: '原地旋转法',
    description: '利用四个位置形成循环的特性，每次同时旋转四个元素，只需要一个临时变量即可完成原地旋转。',
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(1)',
  },
  flip: {
    type: 'flip',
    name: '翻转法',
    description: '先进行水平翻转（上下翻转），再进行主对角线翻转，两次翻转的组合等价于顺时针旋转90度。',
    timeComplexity: 'O(N²)',
    spaceComplexity: 'O(1)',
  },
};

// 生成算法步骤
export function generateSteps(matrix: Matrix, algorithm: AlgorithmType): AlgorithmInfo {
  const description = algorithmDescriptions[algorithm];
  let steps;

  switch (algorithm) {
    case 'auxiliary':
      steps = generateAuxiliarySteps(matrix);
      break;
    case 'inplace':
      steps = generateInplaceSteps(matrix);
      break;
    case 'flip':
      steps = generateFlipSteps(matrix);
      break;
  }

  return {
    ...description,
    steps,
  };
}

// 获取算法描述
export function getAlgorithmDescription(algorithm: AlgorithmType): Omit<AlgorithmInfo, 'steps'> {
  return algorithmDescriptions[algorithm];
}

// 获取所有算法类型
export function getAllAlgorithmTypes(): AlgorithmType[] {
  return ['auxiliary', 'inplace', 'flip'];
}
