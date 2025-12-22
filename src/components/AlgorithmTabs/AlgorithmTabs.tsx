import { AlgorithmType } from '../../types';
import { getAlgorithmDescription } from '../../algorithms';
import styles from './AlgorithmTabs.module.css';

interface AlgorithmTabsProps {
  currentAlgorithm: AlgorithmType;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
}

const algorithms: AlgorithmType[] = ['auxiliary', 'inplace', 'flip'];

export function AlgorithmTabs({ currentAlgorithm, onAlgorithmChange }: AlgorithmTabsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {algorithms.map((algo) => {
          const info = getAlgorithmDescription(algo);
          return (
            <button
              key={algo}
              className={`${styles.tab} ${currentAlgorithm === algo ? styles.active : ''}`}
              onClick={() => onAlgorithmChange(algo)}
            >
              <span className={styles.tabName}>{info.name}</span>
              <span className={styles.tabComplexity}>
                时间 {info.timeComplexity} | 空间 {info.spaceComplexity}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
