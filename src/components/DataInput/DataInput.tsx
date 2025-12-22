import { useState, useCallback } from 'react';
import { Matrix, ExampleData } from '../../types';
import { parseMatrixInput, generateRandomMatrix, matrixToString } from '../../utils/validation';
import styles from './DataInput.module.css';

const EXAMPLES: ExampleData[] = [
  { name: '示例1 (3×3)', matrix: [[1,2,3],[4,5,6],[7,8,9]] },
  { name: '示例2 (4×4)', matrix: [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]] },
  { name: '2×2', matrix: [[1,2],[3,4]] },
  { name: '5×5', matrix: [[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15],[16,17,18,19,20],[21,22,23,24,25]] },
];

interface DataInputProps {
  onMatrixChange: (matrix: Matrix) => void;
  currentMatrix: Matrix;
}

export function DataInput({ onMatrixChange, currentMatrix }: DataInputProps) {
  const [inputValue, setInputValue] = useState(matrixToString(currentMatrix));
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setError(null);
  }, []);

  const handleApply = useCallback(() => {
    const result = parseMatrixInput(inputValue);
    if (result.valid && result.matrix) {
      onMatrixChange(result.matrix);
      setError(null);
    } else {
      setError(result.error || '输入无效');
    }
  }, [inputValue, onMatrixChange]);

  const handleExampleClick = useCallback((example: ExampleData) => {
    const str = matrixToString(example.matrix);
    setInputValue(str);
    setError(null);
    onMatrixChange(example.matrix);
  }, [onMatrixChange]);

  const handleRandom = useCallback(() => {
    const matrix = generateRandomMatrix();
    const str = matrixToString(matrix);
    setInputValue(str);
    setError(null);
    onMatrixChange(matrix);
  }, [onMatrixChange]);

  return (
    <div className={styles.container}>
      <div className={styles.inputRow}>
        <label className={styles.label}>输入矩阵：</label>
        <input
          type="text"
          className={styles.input}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="例如: [[1,2,3],[4,5,6],[7,8,9]]"
        />
        <button className={styles.applyBtn} onClick={handleApply}>
          应用
        </button>
        <button className={styles.randomBtn} onClick={handleRandom}>
          🎲 随机
        </button>
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.examples}>
        <span className={styles.exampleLabel}>示例：</span>
        {EXAMPLES.map((example, index) => (
          <button
            key={index}
            className={styles.exampleBtn}
            onClick={() => handleExampleClick(example)}
          >
            {example.name}
          </button>
        ))}
      </div>
    </div>
  );
}
