import styles from './VariablesPanel.module.css';

interface VariablesPanelProps {
  variables: Record<string, string | number>;
}

export function VariablesPanel({ variables }: VariablesPanelProps) {
  const entries = Object.entries(variables);
  
  if (entries.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.title}>变量状态</div>
      <div className={styles.variables}>
        {entries.map(([name, value]) => (
          <div key={name} className={styles.variable}>
            <span className={styles.name}>{name}</span>
            <span className={styles.equals}>=</span>
            <span className={styles.value}>{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
