import { useState, useEffect, useCallback, useRef } from 'react';
import { Matrix, AlgorithmType, PlaybackState, Language } from './types';
import { generateSteps } from './algorithms';
import { getLanguagePreference } from './utils/storage';
import { Header } from './components/Header';
import { DataInput } from './components/DataInput';
import { AlgorithmTabs } from './components/AlgorithmTabs';
import { CodePanel } from './components/CodePanel';
import { Canvas } from './components/Canvas';
import { PlaybackControls } from './components/PlaybackControls';
import { VariablesPanel } from './components/VariablesPanel';
import { Modal } from './components/Modal';
import { WeChatFloat } from './components/WeChatFloat';
import styles from './App.module.css';

const DEFAULT_MATRIX: Matrix = [[1,2,3],[4,5,6],[7,8,9]];

function App() {
  const [matrix, setMatrix] = useState<Matrix>(DEFAULT_MATRIX);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('auxiliary');
  const [language, setLanguage] = useState<Language>('java');
  const [showThoughts, setShowThoughts] = useState(false);
  
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    speed: 1,
  });

  const algorithmInfo = generateSteps(matrix, algorithm);
  const currentStep = algorithmInfo.steps[playbackState.currentStep] || algorithmInfo.steps[0];
  
  const playIntervalRef = useRef<number | null>(null);

  // 加载语言偏好
  useEffect(() => {
    getLanguagePreference().then(setLanguage);
  }, []);

  // 更新总步数
  useEffect(() => {
    setPlaybackState(prev => ({
      ...prev,
      currentStep: 0,
      totalSteps: algorithmInfo.steps.length,
      isPlaying: false,
    }));
    
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, [matrix, algorithm, algorithmInfo.steps.length]);

  // 自动播放
  useEffect(() => {
    if (playbackState.isPlaying) {
      const interval = 1000 / playbackState.speed;
      playIntervalRef.current = window.setInterval(() => {
        setPlaybackState(prev => {
          if (prev.currentStep >= prev.totalSteps - 1) {
            if (playIntervalRef.current) {
              clearInterval(playIntervalRef.current);
              playIntervalRef.current = null;
            }
            return { ...prev, isPlaying: false };
          }
          return { ...prev, currentStep: prev.currentStep + 1 };
        });
      }, interval);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [playbackState.isPlaying, playbackState.speed]);

  const handlePlay = useCallback(() => {
    if (playbackState.currentStep >= playbackState.totalSteps - 1) {
      setPlaybackState(prev => ({ ...prev, currentStep: 0, isPlaying: true }));
    } else {
      setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [playbackState.currentStep, playbackState.totalSteps]);

  const handlePause = useCallback(() => {
    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handlePrev = useCallback(() => {
    setPlaybackState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      isPlaying: false,
    }));
  }, []);

  const handleNext = useCallback(() => {
    setPlaybackState(prev => ({
      ...prev,
      currentStep: Math.min(prev.totalSteps - 1, prev.currentStep + 1),
      isPlaying: false,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setPlaybackState(prev => ({
      ...prev,
      currentStep: 0,
      isPlaying: false,
    }));
  }, []);

  const handleSeek = useCallback((step: number) => {
    setPlaybackState(prev => ({
      ...prev,
      currentStep: step,
      isPlaying: false,
    }));
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackState(prev => ({ ...prev, speed }));
  }, []);

  const handleMatrixChange = useCallback((newMatrix: Matrix) => {
    setMatrix(newMatrix);
  }, []);

  const handleAlgorithmChange = useCallback((newAlgorithm: AlgorithmType) => {
    setAlgorithm(newAlgorithm);
  }, []);

  const highlightLines = currentStep.codeLineMap[language] || [];
  const showAuxiliary = algorithm === 'auxiliary';

  return (
    <div className={styles.app}>
      <Header onShowThoughts={() => setShowThoughts(true)} />
      <DataInput onMatrixChange={handleMatrixChange} currentMatrix={matrix} />
      <AlgorithmTabs currentAlgorithm={algorithm} onAlgorithmChange={handleAlgorithmChange} />
      
      <div className={styles.main}>
        <div className={styles.canvasSection}>
          <Canvas step={currentStep} showAuxiliary={showAuxiliary} />
        </div>

        <div className={styles.codeSection}>
          <CodePanel
            algorithm={algorithm}
            highlightLines={highlightLines}
            variables={currentStep.variables}
          />
          <VariablesPanel variables={currentStep.variables} />
        </div>
      </div>
      
      <PlaybackControls
        state={playbackState}
        onPlay={handlePlay}
        onPause={handlePause}
        onPrev={handlePrev}
        onNext={handleNext}
        onReset={handleReset}
        onSeek={handleSeek}
        onSpeedChange={handleSpeedChange}
      />

      <WeChatFloat />

      <Modal
        isOpen={showThoughts}
        onClose={() => setShowThoughts(false)}
        title="💡 算法思路"
      >
        <h3>方法一：辅助数组</h3>
        <p>
          对于矩阵中第 i 行的第 j 个元素，在旋转后，它出现在倒数第 i 列的第 j 个位置。
          即 <code>matrix_new[j][n-i-1] = matrix[i][j]</code>
        </p>
        <p>
          使用一个与原矩阵大小相同的辅助数组，将原矩阵的元素按照旋转规则复制到辅助数组中，最后再复制回原矩阵。
        </p>

        <h3>方法二：原地旋转</h3>
        <p>
          观察发现，矩阵中的四个位置形成一个循环：
        </p>
        <p>
          <code>matrix[i][j] → matrix[j][n-i-1] → matrix[n-i-1][n-j-1] → matrix[n-j-1][i] → matrix[i][j]</code>
        </p>
        <p>
          因此可以使用一个临时变量，同时旋转这四个位置的元素，实现原地旋转。
        </p>

        <h3>方法三：翻转代替旋转</h3>
        <p>
          先进行水平翻转（上下翻转），再进行主对角线翻转，两次翻转的组合等价于顺时针旋转90度。
        </p>
        <p>
          <code>matrix[i][j] → matrix[n-i-1][j] → matrix[j][n-i-1]</code>
        </p>
        <p>
          这种方法代码简洁，易于理解和实现。
        </p>
      </Modal>
    </div>
  );
}

export default App;
