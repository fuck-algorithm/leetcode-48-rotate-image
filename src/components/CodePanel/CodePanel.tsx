import { useState, useEffect, useCallback } from 'react';
import { Language, AlgorithmType } from '../../types';
import { getCode } from '../../algorithms';
import { saveLanguagePreference, getLanguagePreference } from '../../utils/storage';
import styles from './CodePanel.module.css';

interface CodePanelProps {
  algorithm: AlgorithmType;
  highlightLines: number[];
  variables: Record<string, string | number>;
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'golang', label: 'Go' },
  { value: 'javascript', label: 'JavaScript' },
];

export function CodePanel({ algorithm, highlightLines, variables }: CodePanelProps) {
  const [language, setLanguage] = useState<Language>('java');

  useEffect(() => {
    getLanguagePreference().then(setLanguage);
  }, []);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    saveLanguagePreference(lang);
  }, []);

  const codeInfo = getCode(algorithm, language);
  const lines = codeInfo.code.split('\n');

  // 获取变量在哪一行显示
  const getVariableForLine = (lineIndex: number): string | null => {
    const lineContent = lines[lineIndex];
    for (const [varName, value] of Object.entries(variables)) {
      // 简单匹配：如果行中包含变量名
      if (lineContent.includes(varName.split('[')[0]) || 
          lineContent.includes('temp') && varName === 'temp') {
        return `${varName} = ${value}`;
      }
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>代码</span>
        <div className={styles.languageTabs}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              className={`${styles.langTab} ${language === lang.value ? styles.active : ''}`}
              onClick={() => handleLanguageChange(lang.value)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className={styles.codeContainer}>
        <pre className={styles.code}>
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const isHighlighted = highlightLines.includes(lineNum);
            const varDisplay = isHighlighted ? getVariableForLine(index) : null;
            
            return (
              <div
                key={index}
                className={`${styles.line} ${isHighlighted ? styles.highlighted : ''}`}
              >
                <span className={styles.lineNumber}>{lineNum}</span>
                <span className={styles.lineContent}>{line || ' '}</span>
                {varDisplay && (
                  <span className={styles.varValue}>{varDisplay}</span>
                )}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
