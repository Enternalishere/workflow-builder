import { useWorkflow } from '../context/WorkflowContext';
import styles from '../styles/Workflow.module.css';

const Controls = () => {
  const { saveWorkflow, undo, redo, canUndo, canRedo } = useWorkflow();

  return (
    <div className={styles.controls}>
      <button className={styles.btn} onClick={undo} disabled={!canUndo}>Undo</button>
      <button className={styles.btn} onClick={redo} disabled={!canRedo}>Redo</button>
      <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveWorkflow}>Save Workflow</button>
    </div>
  );
};

export default Controls;
