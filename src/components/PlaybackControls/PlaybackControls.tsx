import { useState, useEffect, useCallback, useRef } from 'react';
import { PlaybackState } from '../../types';
import { savePlaybackSpeed, getPlaybackSpeed } from '../../utils/storage';
import styles from './PlaybackControls.module.css';

interface PlaybackControlsProps {
  state: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function PlaybackControls({
  state,
  onPlay,
  onPause,
  onPrev,
  onNext,
  onReset,
  onSeek,
  onSpeedChange,
}: PlaybackControlsProps) {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 加载保存的播放速度
  useEffect(() => {
    getPlaybackSpeed().then(speed => {
      if (speed !== state.speed) {
        onSpeedChange(speed);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (state.isPlaying) {
            onPause();
          } else {
            onPlay();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;
        case 'KeyR':
          e.preventDefault();
          onReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isPlaying, onPlay, onPause, onPrev, onNext, onReset]);

  const handleSpeedChange = useCallback((speed: number) => {
    onSpeedChange(speed);
    savePlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, [onSpeedChange]);

  // 进度条拖拽
  const calculateStep = useCallback((clientX: number) => {
    if (!progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(percent * (state.totalSteps - 1));
  }, [state.totalSteps]);

  const handleProgressMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const step = calculateStep(e.clientX);
    onSeek(step);
  };

  const handleProgressMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const step = calculateStep(e.clientX);
    onSeek(step);
  }, [isDragging, calculateStep, onSeek]);

  const handleProgressMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleProgressMouseMove);
      window.addEventListener('mouseup', handleProgressMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleProgressMouseMove);
        window.removeEventListener('mouseup', handleProgressMouseUp);
      };
    }
  }, [isDragging, handleProgressMouseMove, handleProgressMouseUp]);

  const progress = state.totalSteps > 1 
    ? (state.currentStep / (state.totalSteps - 1)) * 100 
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        <button className={styles.btn} onClick={onPrev} title="上一步 (←)">
          ⏮ <span className={styles.shortcut}>←</span>
        </button>
        
        <button 
          className={`${styles.btn} ${styles.playBtn}`} 
          onClick={state.isPlaying ? onPause : onPlay}
          title={state.isPlaying ? '暂停 (空格)' : '播放 (空格)'}
        >
          {state.isPlaying ? '⏸' : '▶'} <span className={styles.shortcut}>空格</span>
        </button>
        
        <button className={styles.btn} onClick={onNext} title="下一步 (→)">
          ⏭ <span className={styles.shortcut}>→</span>
        </button>
        
        <button className={styles.btn} onClick={onReset} title="重置 (R)">
          ⟲ <span className={styles.shortcut}>R</span>
        </button>

        <div className={styles.speedControl}>
          <button 
            className={styles.speedBtn}
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          >
            {state.speed}x ▾
          </button>
          
          {showSpeedMenu && (
            <div className={styles.speedMenu}>
              {SPEED_OPTIONS.map(speed => (
                <button
                  key={speed}
                  className={`${styles.speedOption} ${state.speed === speed ? styles.active : ''}`}
                  onClick={() => handleSpeedChange(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>

        <span className={styles.stepInfo}>
          {state.currentStep + 1} / {state.totalSteps}
        </span>
      </div>

      <div 
        ref={progressRef}
        className={styles.progressBar}
        onMouseDown={handleProgressMouseDown}
      >
        <div 
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
        <div 
          className={styles.progressHandle}
          style={{ left: `${progress}%` }}
        />
      </div>
    </div>
  );
}
